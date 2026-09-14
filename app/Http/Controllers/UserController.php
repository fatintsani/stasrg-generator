<?php

namespace App\Http\Controllers;

use App\Mail\AccountApprovedMail;
use App\Mail\AccountRejectedMail;
use App\Mail\AccountStatusChangedMail;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * Display listing of all users and approval requests with search, filter, and sorting.
     */
    public function index(Request $request): Response
    {
        $query = User::query();

        if ($request->filled('search')) {
            $search = trim($request->input('search'));
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('username', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status') && $request->input('status') !== 'all') {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('role') && $request->input('role') !== 'all') {
            $query->where('role', $request->input('role'));
        }

        $sort = $request->input('sort', 'created_at');
        $direction = strtolower($request->input('direction', 'desc')) === 'asc' ? 'asc' : 'desc';

        $allowedSorts = ['name', 'email', 'username', 'role', 'status', 'created_at', 'approved_at'];
        if (in_array($sort, $allowedSorts, true)) {
            $query->orderBy($sort, $direction);
        } else {
            $query->latest('created_at');
        }

        $users = $query->paginate(15)->withQueryString();

        $stats = [
            'total' => User::count(),
            'pending' => User::where('status', User::STATUS_PENDING)->count(),
            'approved' => User::where('status', User::STATUS_APPROVED)->count(),
            'rejected' => User::where('status', User::STATUS_REJECTED)->count(),
            'inactive' => User::where('status', User::STATUS_INACTIVE)->count(),
        ];

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'stats' => $stats,
            'filters' => [
                'search' => $request->input('search', ''),
                'status' => $request->input('status', 'all'),
                'role' => $request->input('role', 'all'),
                'sort' => $sort,
                'direction' => $direction,
            ],
        ]);
    }

    /**
     * Store a newly created user account from admin panel.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'username' => ['nullable', 'string', 'max:255', 'alpha_dash', 'unique:users,username'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', Password::min(8)],
            'role' => ['required', 'string', 'in:admin,researcher,user'],
            'status' => ['required', 'string', 'in:approved,pending,inactive'],
        ], [
            'name.required' => 'Nama lengkap wajib diisi.',
            'email.required' => 'Alamat email wajib diisi.',
            'email.unique' => 'Email ini sudah terdaftar di sistem.',
            'username.unique' => 'Username ini sudah digunakan.',
            'username.alpha_dash' => 'Username hanya boleh berisi huruf, angka, tanda hubung, dan garis bawah.',
            'password.min' => 'Kata sandi minimal harus 8 karakter.',
        ]);

        if (empty($validated['username'])) {
            $baseUsername = Str::slug($validated['name'], '');
            if (empty($baseUsername)) {
                $baseUsername = explode('@', $validated['email'])[0];
            }
            $username = $baseUsername;
            $counter = 1;
            while (User::where('username', $username)->exists()) {
                $username = $baseUsername.$counter;
                $counter++;
            }
            $validated['username'] = $username;
        }

        $isApproved = $validated['status'] === User::STATUS_APPROVED;

        $user = User::create([
            'name' => $validated['name'],
            'username' => $validated['username'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'status' => $validated['status'],
            'approved_at' => $isApproved ? now() : null,
        ]);

        if ($isApproved) {
            try {
                Mail::to($user->email)->send(new AccountApprovedMail($user));
            } catch (\Throwable $e) {
                Log::warning('Failed to send account creation approval email: '.$e->getMessage());
            }
        }

        ActivityLogger::logUser(
            action: 'user.created_by_admin',
            description: "Admin membuat akun baru \"{$user->name}\" ({$user->email}) dengan status {$user->status}",
            subjectUser: $user,
            properties: [
                'role' => $user->role,
                'status' => $user->status,
            ],
            actor: $request->user(),
            request: $request
        );

        return back()->with('success', "Akun {$user->name} ({$user->email}) berhasil ditambahkan ke sistem!");
    }

    /**
     * Approve a pending user account.
     */
    public function approve(User $user): RedirectResponse
    {
        $user->update([
            'status' => User::STATUS_APPROVED,
            'role' => 'admin',
            'rejection_reason' => null,
            'approved_at' => now(),
        ]);

        try {
            Mail::to($user->email)->send(new AccountApprovedMail($user));
        } catch (\Throwable $e) {
            Log::warning('Failed to send account approval email: '.$e->getMessage());
        }

        ActivityLogger::logUser(
            action: 'user.approved',
            description: "Menyetujui pendaftaran akun \"{$user->name}\" ({$user->email}) sebagai Admin",
            subjectUser: $user,
            properties: [
                'email' => $user->email,
                'role' => 'admin',
            ],
            actor: Auth::user(),
            request: request()
        );

        return back()->with('success', "Akun {$user->name} ({$user->email}) berhasil disetujui sebagai Admin!");
    }

    /**
     * Reject a user account.
     */
    public function reject(Request $request, User $user): RedirectResponse
    {
        $reason = $request->input('reason', 'Tidak memenuhi kriteria aktivasi.');

        $user->update([
            'status' => User::STATUS_REJECTED,
            'rejection_reason' => $reason,
        ]);

        try {
            Mail::to($user->email)->send(new AccountRejectedMail($user, $reason));
        } catch (\Throwable $e) {
            Log::warning('Failed to send account rejection email: '.$e->getMessage());
        }

        ActivityLogger::logUser(
            action: 'user.rejected',
            description: "Menolak pendaftaran akun \"{$user->name}\" ({$user->email}). Alasan: {$reason}",
            subjectUser: $user,
            properties: [
                'email' => $user->email,
                'reason' => $reason,
            ],
            actor: $request->user(),
            request: $request
        );

        return back()->with('success', "Akun {$user->name} telah ditolak.");
    }

    /**
     * Toggle user active/inactive status.
     */
    public function toggleStatus(User $user): RedirectResponse
    {
        if ($user->id === Auth::id()) {
            return back()->withErrors(['error' => 'Anda tidak dapat menonaktifkan akun Anda sendiri.']);
        }

        $newStatus = $user->isApproved() ? User::STATUS_INACTIVE : User::STATUS_APPROVED;
        $user->update([
            'status' => $newStatus,
            'approved_at' => $newStatus === User::STATUS_APPROVED ? ($user->approved_at ?? now()) : $user->approved_at,
        ]);

        $statusLabel = $newStatus === User::STATUS_APPROVED ? 'diaktifkan' : 'dinonaktifkan';

        try {
            $mappedStatus = $newStatus === User::STATUS_APPROVED ? 'active' : 'inactive';
            Mail::to($user->email)->send(new AccountStatusChangedMail($user, $mappedStatus));
        } catch (\Throwable $e) {
            Log::warning('Failed to send account status change email: '.$e->getMessage());
        }

        ActivityLogger::logUser(
            action: 'user.status_toggled',
            description: "Mengubah status akun \"{$user->name}\" ({$user->email}) menjadi {$statusLabel}",
            subjectUser: $user,
            properties: [
                'old_status' => $newStatus === User::STATUS_APPROVED ? User::STATUS_INACTIVE : User::STATUS_APPROVED,
                'new_status' => $newStatus,
            ],
            actor: Auth::user(),
            request: request()
        );

        return back()->with('success', "Akun {$user->name} berhasil {$statusLabel}.");
    }

    /**
     * Delete a user account.
     */
    public function destroy(User $user): RedirectResponse
    {
        if ($user->id === Auth::id()) {
            return back()->withErrors(['error' => 'Anda tidak dapat menghapus akun Anda sendiri.']);
        }

        $userName = $user->name;
        $userEmail = $user->email;
        $deletedUserId = $user->id;

        $user->delete();

        ActivityLogger::logUser(
            action: 'user.deleted',
            description: "Menghapus akun pengguna \"{$userName}\" ({$userEmail}) dari sistem",
            subjectUser: null,
            properties: [
                'deleted_user_id' => $deletedUserId,
                'name' => $userName,
                'email' => $userEmail,
            ],
            actor: Auth::user(),
            request: request()
        );

        return back()->with('success', "Akun {$userName} berhasil dihapus dari sistem.");
    }
}
