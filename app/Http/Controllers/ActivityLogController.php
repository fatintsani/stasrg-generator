<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Project;
use App\Services\ActivityLogger;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ActivityLogController extends Controller
{
    /**
     * Display listing of activity and audit logs.
     */
    public function index(Request $request): Response
    {
        $query = ActivityLog::with(['user:id,name,username,email,avatar,role'])->latest('id');

        // Filter by Log Type
        if ($request->filled('type') && $request->input('type') !== 'all') {
            $query->where('log_type', $request->input('type'));
        }

        // Filter by Search Query
        if ($request->filled('search')) {
            $search = trim($request->input('search'));
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                    ->orWhere('action', 'like', "%{$search}%")
                    ->orWhere('ip_address', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($userQuery) use ($search) {
                        $userQuery->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%")
                            ->orWhere('username', 'like', "%{$search}%");
                    });
            });
        }

        // Filter by Date Range
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->input('date_from'));
        }
        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->input('date_to'));
        }

        $logs = $query->paginate(20)->withQueryString();

        // Format logs data for frontend
        $logs->through(function ($log) {
            return [
                'id' => $log->id,
                'log_type' => $log->log_type,
                'action' => $log->action,
                'description' => $log->description,
                'subject_type' => $log->subject_type ? class_basename($log->subject_type) : null,
                'subject_id' => $log->subject_id,
                'properties' => $log->properties,
                'ip_address' => $log->ip_address,
                'user_agent' => $log->user_agent,
                'user' => $log->user ? [
                    'id' => $log->user->id,
                    'name' => $log->user->name,
                    'email' => $log->user->email,
                    'avatar_url' => $log->user->avatar_url,
                    'role' => $log->user->role,
                ] : null,
                'created_at' => $log->created_at->format('d M Y, H:i:s'),
                'created_at_relative' => $log->created_at->diffForHumans(),
            ];
        });

        // Statistics Summary
        $today = Carbon::today();
        $stats = [
            'total' => ActivityLog::count(),
            'today' => ActivityLog::whereDate('created_at', $today)->count(),
            'auth' => ActivityLog::where('log_type', ActivityLog::TYPE_AUTH)->count(),
            'project' => ActivityLog::where('log_type', ActivityLog::TYPE_PROJECT)->count(),
            'export' => ActivityLog::where('log_type', ActivityLog::TYPE_EXPORT)->count(),
            'user' => ActivityLog::where('log_type', ActivityLog::TYPE_USER)->count(),
        ];

        return Inertia::render('Admin/ActivityLogs/Index', [
            'logs' => $logs,
            'stats' => $stats,
            'filters' => [
                'type' => $request->input('type', 'all'),
                'search' => $request->input('search', ''),
                'date_from' => $request->input('date_from', ''),
                'date_to' => $request->input('date_to', ''),
            ],
        ]);
    }

    /**
     * Export filtered activity logs as CSV file.
     */
    public function exportCsv(Request $request): StreamedResponse
    {
        $query = ActivityLog::with('user')->latest('id');

        if ($request->filled('type') && $request->input('type') !== 'all') {
            $query->where('log_type', $request->input('type'));
        }

        if ($request->filled('search')) {
            $search = trim($request->input('search'));
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                    ->orWhere('action', 'like', "%{$search}%")
                    ->orWhere('ip_address', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($userQuery) use ($search) {
                        $userQuery->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            });
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->input('date_from'));
        }
        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->input('date_to'));
        }

        $filename = 'stasrg_activity_logs_'.now()->format('Y-m-d_His').'.csv';

        return response()->streamDownload(function () use ($query) {
            $handle = fopen('php://output', 'w');

            // UTF-8 BOM for Excel compatibility
            fwrite($handle, "\xEF\xBB\xBF");

            // CSV Header
            fputcsv($handle, [
                'ID',
                'Waktu (UTC+7)',
                'Kategori',
                'Aksi',
                'Deskripsi',
                'User Nama',
                'User Email',
                'IP Address',
                'Target Model',
                'Metadata / Properties',
            ]);

            $query->chunk(200, function ($logs) use ($handle) {
                foreach ($logs as $log) {
                    fputcsv($handle, [
                        $log->id,
                        $log->created_at->format('Y-m-d H:i:s'),
                        strtoupper($log->log_type),
                        $log->action,
                        $log->description,
                        $log->user ? $log->user->name : 'Sistem / Tamu',
                        $log->user ? $log->user->email : '-',
                        $log->ip_address ?: '-',
                        $log->subject_type ? class_basename($log->subject_type).' #'.$log->subject_id : '-',
                        $log->properties ? json_encode($log->properties, JSON_UNESCAPED_UNICODE) : '-',
                    ]);
                }
            });

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Cache-Control' => 'no-cache, no-store, must-revalidate',
            'Pragma' => 'no-cache',
            'Expires' => '0',
        ]);
    }

    /**
     * AJAX endpoint to record client-side flyer export/print actions.
     */
    public function trackExport(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'project_id' => ['nullable', 'integer'],
            'project_name' => ['nullable', 'string', 'max:255'],
            'format' => ['required', 'string', 'in:png,pdf,print'],
            'action_type' => ['nullable', 'string'],
        ]);

        $project = null;
        if (! empty($validated['project_id'])) {
            $project = Project::find($validated['project_id']);
        }

        $projectName = $project ? $project->name : ($validated['project_name'] ?? 'Dokumen Flyer');
        $formatName = strtoupper($validated['format']);

        ActivityLogger::logExport(
            action: 'export.'.$validated['format'],
            description: "Mengekspor / mencetak flyer riset \"{$projectName}\" ke format {$formatName}",
            project: $project,
            properties: [
                'project_name' => $projectName,
                'format' => $validated['format'],
                'action_type' => $validated['action_type'] ?? 'direct_download',
            ],
            request: $request
        );

        return response()->json([
            'success' => true,
            'message' => 'Export logged successfully',
        ]);
    }

    /**
     * Delete old logs older than specified days (Admin maintenance action).
     */
    public function destroyOld(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'days' => ['required', 'integer', 'in:30,60,90,180'],
        ]);

        $days = (int) $validated['days'];
        $cutoffDate = Carbon::now()->subDays($days);
        $deletedCount = ActivityLog::where('created_at', '<', $cutoffDate)->delete();

        ActivityLogger::logSystem(
            action: 'system.logs_pruned',
            description: "Membersihkan {$deletedCount} log audit yang berusia lebih dari {$days} hari",
            properties: [
                'days' => $days,
                'deleted_count' => $deletedCount,
            ],
            user: $request->user(),
            request: $request
        );

        return back()->with('success', "Berhasil menghapus {$deletedCount} catatan log yang berusia lebih dari {$days} hari.");
    }
}
