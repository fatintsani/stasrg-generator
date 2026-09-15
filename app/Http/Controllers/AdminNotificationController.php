<?php

namespace App\Http\Controllers;

use App\Services\AdminNotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminNotificationController extends Controller
{
    public function __construct(
        protected AdminNotificationService $notificationService
    ) {}

    /**
     * Get active notifications with counts and optional filtering.
     */
    public function index(Request $request): JsonResponse
    {
        $filter = $request->query('filter', 'all');
        $limit = (int) $request->query('limit', 30);
        $userId = $request->user()?->id;

        $result = $this->notificationService->getNotifications($userId, $filter, $limit);

        return response()->json([
            'success' => true,
            'data' => $result['notifications'],
            'counts' => $result['counts'],
        ]);
    }

    /**
     * Mark single notification as read.
     */
    public function markAsRead(Request $request, int $id): JsonResponse
    {
        $userId = $request->user()?->id;
        $success = $this->notificationService->markAsRead($id, $userId);

        return response()->json([
            'success' => $success,
            'message' => $success ? 'Notifikasi berhasil ditandai telah dibaca.' : 'Notifikasi tidak ditemukan.',
        ]);
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllAsRead(Request $request): JsonResponse
    {
        $userId = $request->user()?->id;
        $count = $this->notificationService->markAllAsRead($userId);

        return response()->json([
            'success' => true,
            'message' => "{$count} notifikasi telah ditandai telah dibaca.",
            'updated_count' => $count,
        ]);
    }

    /**
     * Delete single notification.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $userId = $request->user()?->id;
        $deleted = $this->notificationService->deleteNotification($id, $userId);

        return response()->json([
            'success' => $deleted,
            'message' => $deleted ? 'Notifikasi berhasil dihapus.' : 'Notifikasi tidak ditemukan.',
        ]);
    }

    /**
     * Clear all notifications.
     */
    public function clearAll(Request $request): JsonResponse
    {
        $userId = $request->user()?->id;
        $count = $this->notificationService->clearAll($userId);

        return response()->json([
            'success' => true,
            'message' => 'Semua riwayat notifikasi telah dibersihkan.',
            'deleted_count' => $count,
        ]);
    }
}
