<?php

namespace App\Services;

use App\Models\AdminNotification;
use App\Models\SupportTicket;
use App\Models\User;
use Illuminate\Support\Facades\Schema;

class AdminNotificationService
{
    /**
     * Synchronize live database alerts into admin notifications.
     */
    public function syncLiveNotifications(?int $userId = null): void
    {
        if (! Schema::hasTable('admin_notifications')) {
            return;
        }

        // 1. Sync Pending User Approvals
        if (Schema::hasTable('users')) {
            $pendingUsers = User::where('status', User::STATUS_PENDING)
                ->latest()
                ->take(10)
                ->get();

            foreach ($pendingUsers as $user) {
                $exists = AdminNotification::where('type', 'user')
                    ->whereJsonContains('data->user_id', $user->id)
                    ->exists();

                if (! $exists) {
                    AdminNotification::create([
                        'user_id' => null,
                        'type' => 'user',
                        'title' => 'Pendaftaran Peneliti / User Baru',
                        'message' => "Pengguna {$user->name} ({$user->email}) menunggu persetujuan (approval) akun dari Administrator.",
                        'action_url' => '/users',
                        'icon' => 'UserPlus',
                        'level' => 'warning',
                        'data' => [
                            'user_id' => $user->id,
                            'name' => $user->name,
                            'email' => $user->email,
                        ],
                        'created_at' => $user->created_at ?? now(),
                    ]);
                }
            }
        }

        // 2. Sync Open Support Tickets
        if (Schema::hasTable('support_tickets')) {
            $openTickets = SupportTicket::where('status', 'open')
                ->latest()
                ->take(10)
                ->get();

            foreach ($openTickets as $ticket) {
                $exists = AdminNotification::where('type', 'ticket')
                    ->whereJsonContains('data->ticket_id', $ticket->id)
                    ->exists();

                if (! $exists) {
                    $level = $ticket->priority === 'urgent' ? 'urgent' : ($ticket->priority === 'high' ? 'warning' : 'info');
                    AdminNotification::create([
                        'user_id' => null,
                        'type' => 'ticket',
                        'title' => "Tiket Bantuan Terbuka #{$ticket->ticket_number}",
                        'message' => "Tiket '{$ticket->subject}' dari {$ticket->name} ({$ticket->category}) memerlukan respon tim CoE STAS-RG.",
                        'action_url' => "/support-tickets/{$ticket->id}",
                        'icon' => 'LifeBuoy',
                        'level' => $level,
                        'data' => [
                            'ticket_id' => $ticket->id,
                            'ticket_number' => $ticket->ticket_number,
                            'priority' => $ticket->priority,
                        ],
                        'created_at' => $ticket->created_at ?? now(),
                    ]);
                }
            }
        }
    }

    /**
     * Get list of notifications and summary counts.
     */
    public function getNotifications(?int $userId = null, string $filter = 'all', int $limit = 30): array
    {
        $this->syncLiveNotifications($userId);

        $baseQuery = AdminNotification::forUser($userId);

        // Counts calculation
        $totalCount = (clone $baseQuery)->count();
        $unreadCount = (clone $baseQuery)->unread()->count();
        $ticketCount = (clone $baseQuery)->where('type', 'ticket')->count();
        $userCount = (clone $baseQuery)->where('type', 'user')->count();
        $systemCount = (clone $baseQuery)->whereIn('type', ['system', 'project', 'ai'])->count();

        // Apply tab filter
        $query = (clone $baseQuery)->latest();

        if ($filter === 'unread') {
            $query->unread();
        } elseif ($filter === 'ticket') {
            $query->where('type', 'ticket');
        } elseif ($filter === 'user') {
            $query->where('type', 'user');
        } elseif ($filter === 'system') {
            $query->whereIn('type', ['system', 'project', 'ai']);
        }

        $notifications = $query->take($limit)->get()->map(function ($notif) {
            return [
                'id' => $notif->id,
                'type' => $notif->type,
                'title' => $notif->title,
                'message' => $notif->message,
                'action_url' => $notif->action_url,
                'icon' => $notif->icon ?? 'Bell',
                'level' => $notif->level ?? 'info',
                'data' => $notif->data,
                'read_at' => $notif->read_at ? $notif->read_at->toIso8601String() : null,
                'is_read' => ! is_null($notif->read_at),
                'created_at' => $notif->created_at->toIso8601String(),
                'time_ago' => $notif->created_at->diffForHumans(),
            ];
        });

        return [
            'notifications' => $notifications,
            'counts' => [
                'total' => $totalCount,
                'unread' => $unreadCount,
                'ticket' => $ticketCount,
                'user' => $userCount,
                'system' => $systemCount,
            ],
        ];
    }

    /**
     * Mark single notification as read.
     */
    public function markAsRead(int $id, ?int $userId = null): bool
    {
        $notification = AdminNotification::forUser($userId)->find($id);
        if ($notification) {
            return $notification->markAsRead();
        }

        return false;
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllAsRead(?int $userId = null): int
    {
        return AdminNotification::forUser($userId)
            ->unread()
            ->update(['read_at' => now()]);
    }

    /**
     * Delete single notification.
     */
    public function deleteNotification(int $id, ?int $userId = null): bool
    {
        $notification = AdminNotification::forUser($userId)->find($id);
        if ($notification) {
            return (bool) $notification->delete();
        }

        return false;
    }

    /**
     * Clear all notifications.
     */
    public function clearAll(?int $userId = null): int
    {
        return AdminNotification::forUser($userId)->delete();
    }

    /**
     * Create a new custom notification.
     */
    public function createNotification(
        string $type,
        string $title,
        string $message,
        ?string $actionUrl = null,
        string $icon = 'Bell',
        string $level = 'info',
        ?array $data = null,
        ?int $userId = null
    ): AdminNotification {
        return AdminNotification::create([
            'user_id' => $userId,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'action_url' => $actionUrl,
            'icon' => $icon,
            'level' => $level,
            'data' => $data,
            'read_at' => null,
        ]);
    }
}
