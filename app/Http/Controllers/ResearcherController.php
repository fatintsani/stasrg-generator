<?php

namespace App\Http\Controllers;

use App\Models\Researcher;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ResearcherController extends Controller
{
    /**
     * Display a listing of researchers.
     */
    public function index(Request $request): Response
    {
        $role = $request->input('role', 'all');
        $search = $request->input('search', '');
        $sort = $request->input('sort', 'created_at');
        $direction = strtolower($request->input('direction', 'desc')) === 'asc' ? 'asc' : 'desc';

        $query = Researcher::query()
            ->byRole($role)
            ->search($search);

        if (in_array($sort, ['name', 'role', 'identifier', 'usage_count', 'created_at'])) {
            $query->orderBy($sort, $direction);
        } else {
            $query->latest();
        }

        $researchers = $query->paginate(20)->withQueryString();

        $stats = [
            'total' => Researcher::count(),
            'pi_leads' => Researcher::where('role', 'like', '%Ketua%')->orWhere('role', 'like', '%Principal%')->count(),
            'lecturers' => Researcher::where('role', 'like', '%Dosen%')->orWhere('role', 'like', '%Pembimbing%')->count(),
            'students' => Researcher::where('role', 'like', '%Mahasiswa%')->orWhere('role', 'like', '%Student%')->count(),
            'researchers_count' => Researcher::where('role', 'like', '%Anggota Peneliti%')->count(),
            'total_usage' => Researcher::sum('usage_count'),
        ];

        return Inertia::render('Admin/Researchers/Index', [
            'researchers' => $researchers,
            'stats' => $stats,
            'filters' => [
                'role' => $role,
                'search' => $search,
                'sort' => $sort,
                'direction' => $direction,
            ],
            'availableRoles' => $this->getAvailableRoles(),
        ]);
    }

    /**
     * JSON API Endpoint for the Researcher Picker Modal in Project Forms.
     */
    public function apiList(Request $request): JsonResponse
    {
        $role = $request->input('role');
        $search = $request->input('search');

        $query = Researcher::query()
            ->active()
            ->byRole($role)
            ->search($search)
            ->orderBy('usage_count', 'desc')
            ->orderBy('name', 'asc');

        $researchers = $query->take(50)->get();

        return response()->json([
            'success' => true,
            'data' => $researchers,
        ]);
    }

    /**
     * Store a newly created researcher.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'role' => ['required', 'string', 'max:255'],
            'identifier' => ['nullable', 'string', 'max:100'],
            'lab_affiliation' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'avatar_file' => ['nullable', 'image', 'max:5120'],
            'avatar' => ['nullable', 'string'],
            'scholar_url' => ['nullable', 'string', 'max:255'],
            'scopus_url' => ['nullable', 'string', 'max:255'],
            'sinta_url' => ['nullable', 'string', 'max:255'],
            'orcid_url' => ['nullable', 'string', 'max:255'],
            'linkedin_url' => ['nullable', 'string', 'max:255'],
            'expertise' => ['nullable'],
            'bio' => ['nullable', 'string', 'max:1000'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $avatarPath = null;
        if ($request->hasFile('avatar_file')) {
            $avatarPath = $request->file('avatar_file')->store('projects/avatars', 'public');
        } elseif (! empty($validated['avatar'])) {
            if (str_starts_with($validated['avatar'], 'data:image/')) {
                $avatarPath = $this->storeBase64Avatar($validated['avatar']);
            } else {
                $avatarPath = str_replace('/storage/', '', $validated['avatar']);
            }
        }

        $validated['avatar'] = $avatarPath;
        $validated['is_active'] = $validated['is_active'] ?? true;
        $validated['created_by'] = Auth::id();
        unset($validated['avatar_file']);

        // Format expertise to array
        $rawExpertise = $request->input('expertise');
        if (is_string($rawExpertise)) {
            $parsed = array_values(array_filter(array_map('trim', explode(',', $rawExpertise))));
            $validated['expertise'] = ! empty($parsed) ? $parsed : null;
        } elseif (is_array($rawExpertise)) {
            $parsed = array_values(array_filter(array_map('trim', $rawExpertise)));
            $validated['expertise'] = ! empty($parsed) ? $parsed : null;
        } else {
            $validated['expertise'] = null;
        }

        Researcher::create($validated);

        return redirect()->back()->with('success', 'Data peneliti berhasil ditambahkan ke direktori!');
    }

    /**
     * Update the specified researcher.
     */
    public function update(Request $request, Researcher $researcher): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'role' => ['required', 'string', 'max:255'],
            'identifier' => ['nullable', 'string', 'max:100'],
            'lab_affiliation' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'avatar_file' => ['nullable', 'image', 'max:5120'],
            'avatar' => ['nullable', 'string'],
            'scholar_url' => ['nullable', 'string', 'max:255'],
            'scopus_url' => ['nullable', 'string', 'max:255'],
            'sinta_url' => ['nullable', 'string', 'max:255'],
            'orcid_url' => ['nullable', 'string', 'max:255'],
            'linkedin_url' => ['nullable', 'string', 'max:255'],
            'expertise' => ['nullable'],
            'bio' => ['nullable', 'string', 'max:1000'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        if ($request->hasFile('avatar_file')) {
            if ($researcher->avatar && Storage::disk('public')->exists($researcher->avatar)) {
                Storage::disk('public')->delete($researcher->avatar);
            }
            $validated['avatar'] = $request->file('avatar_file')->store('projects/avatars', 'public');
        } elseif (isset($validated['avatar']) && str_starts_with($validated['avatar'], 'data:image/')) {
            $validated['avatar'] = $this->storeBase64Avatar($validated['avatar']);
        } elseif (isset($validated['avatar'])) {
            $validated['avatar'] = str_replace('/storage/', '', $validated['avatar']);
        }

        unset($validated['avatar_file']);

        // Format expertise to array
        if ($request->has('expertise')) {
            $rawExpertise = $request->input('expertise');
            if (is_string($rawExpertise)) {
                $parsed = array_values(array_filter(array_map('trim', explode(',', $rawExpertise))));
                $validated['expertise'] = ! empty($parsed) ? $parsed : null;
            } elseif (is_array($rawExpertise)) {
                $parsed = array_values(array_filter(array_map('trim', $rawExpertise)));
                $validated['expertise'] = ! empty($parsed) ? $parsed : null;
            } else {
                $validated['expertise'] = null;
            }
        }

        $researcher->update($validated);

        return redirect()->back()->with('success', 'Data peneliti berhasil diperbarui!');
    }

    /**
     * Remove the specified researcher.
     */
    public function destroy(Researcher $researcher): RedirectResponse
    {
        if ($researcher->avatar && Storage::disk('public')->exists($researcher->avatar)) {
            Storage::disk('public')->delete($researcher->avatar);
        }

        $researcher->delete();

        return redirect()->back()->with('success', 'Data peneliti berhasil dihapus dari direktori.');
    }

    /**
     * Quick store endpoint to save a researcher directly from the Project Form.
     */
    public function quickStore(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'role' => ['nullable', 'string', 'max:255'],
            'identifier' => ['nullable', 'string', 'max:100'],
            'lab_affiliation' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'avatar' => ['nullable', 'string'],
            'scholar_url' => ['nullable', 'string', 'max:255'],
            'scopus_url' => ['nullable', 'string', 'max:255'],
            'sinta_url' => ['nullable', 'string', 'max:255'],
            'orcid_url' => ['nullable', 'string', 'max:255'],
            'linkedin_url' => ['nullable', 'string', 'max:255'],
            'expertise' => ['nullable'],
            'bio' => ['nullable', 'string', 'max:1000'],
        ]);

        $avatarPath = null;
        if (! empty($validated['avatar'])) {
            if (str_starts_with($validated['avatar'], 'data:image/')) {
                $avatarPath = $this->storeBase64Avatar($validated['avatar']);
            } else {
                $avatarPath = str_replace('/storage/', '', $validated['avatar']);
            }
        }

        $validated['role'] = $validated['role'] ?? 'Anggota Peneliti';
        $validated['avatar'] = $avatarPath;
        $validated['is_active'] = true;
        $validated['created_by'] = Auth::id();

        if ($request->has('expertise')) {
            $rawExpertise = $request->input('expertise');
            if (is_string($rawExpertise)) {
                $parsed = array_values(array_filter(array_map('trim', explode(',', $rawExpertise))));
                $validated['expertise'] = ! empty($parsed) ? $parsed : null;
            } elseif (is_array($rawExpertise)) {
                $parsed = array_values(array_filter(array_map('trim', $rawExpertise)));
                $validated['expertise'] = ! empty($parsed) ? $parsed : null;
            } else {
                $validated['expertise'] = null;
            }
        }

        // Check if identical name & identifier already exists
        $existing = Researcher::where('name', $validated['name'])
            ->when(! empty($validated['identifier']), fn ($q) => $q->where('identifier', $validated['identifier']))
            ->first();

        if ($existing) {
            $existing->update(array_filter($validated));
            $existing->incrementUsage();

            return response()->json([
                'success' => true,
                'message' => 'Data peneliti yang sudah ada berhasil diperbarui di direktori!',
                'data' => $existing,
            ]);
        }

        $researcher = Researcher::create($validated);
        $researcher->incrementUsage();

        return response()->json([
            'success' => true,
            'message' => 'Peneliti berhasil disimpan ke Direktori Master!',
            'data' => $researcher,
        ]);
    }

    /**
     * Store base64 data image URL for researcher avatar.
     */
    private function storeBase64Avatar(?string $dataUrl): ?string
    {
        if (empty($dataUrl) || ! str_starts_with($dataUrl, 'data:image/')) {
            return null;
        }

        try {
            preg_match('#^data:image/(\w+);base64,#i', $dataUrl, $matches);
            $extension = strtolower($matches[1] ?? 'png');
            if ($extension === 'jpeg') {
                $extension = 'jpg';
            }

            $data = substr($dataUrl, strpos($dataUrl, ',') + 1);
            $decoded = base64_decode($data);

            if ($decoded === false) {
                return null;
            }

            $filename = 'projects/avatars/'.uniqid('avatar_').'.'.$extension;
            Storage::disk('public')->put($filename, $decoded);

            return $filename;
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Get available role options for researchers.
     *
     * @return list<string>
     */
    private function getAvailableRoles(): array
    {
        return [
            'Principal Investigator / Ketua Peneliti',
            'Dosen Peneliti / Pembimbing',
            'Anggota Peneliti',
            'Mahasiswa Peneliti / Asisten Riset',
            'Teknisi / Engineer Riset',
            'Mitra Kolaborator Eksternal',
        ];
    }
}
