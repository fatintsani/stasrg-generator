<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class SupportTicket extends Model
{
    use HasFactory;

    public const STATUS_PENDING = 'pending';

    public const STATUS_NEW = 'pending';

    public const STATUS_IN_PROGRESS = 'in_progress';

    public const STATUS_RESOLVED = 'resolved';

    public const STATUS_CLOSED = 'closed';

    public const CATEGORY_GENERAL = 'general';

    public const CATEGORY_TECHNICAL = 'technical_issue';

    public const CATEGORY_PARTNERSHIP = 'partnership';

    public const CATEGORY_FEATURE = 'feature_request';

    public const CATEGORY_ACCOUNT = 'account_access';

    public const CATEGORY_OTHER = 'other';

    public const PRIORITY_LOW = 'low';

    public const PRIORITY_MEDIUM = 'medium';

    public const PRIORITY_HIGH = 'high';

    public const PRIORITY_URGENT = 'urgent';

    protected $fillable = [
        'ticket_number',
        'name',
        'email',
        'affiliation',
        'phone',
        'category',
        'priority',
        'subject',
        'message',
        'attachment_path',
        'attachment_original_name',
        'attachment_size',
        'status',
        'admin_notes',
        'resolved_by',
        'resolved_at',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'resolved_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Generate unique ticket reference code.
     */
    public static function generateTicketNumber(): string
    {
        $datePrefix = date('Ymd');
        do {
            $random = strtoupper(Str::random(4));
            $ticketNumber = "STAS-{$datePrefix}-{$random}";
        } while (static::where('ticket_number', $ticketNumber)->exists());

        return $ticketNumber;
    }

    /**
     * Admin user who resolved or handled the ticket.
     */
    public function resolver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'resolved_by');
    }

    /**
     * Scope for filtering by status.
     */
    public function scopeStatus($query, ?string $status)
    {
        if ($status && $status !== 'all') {
            return $query->where('status', $status);
        }

        return $query;
    }

    /**
     * Scope for filtering by category.
     */
    public function scopeCategory($query, ?string $category)
    {
        if ($category && $category !== 'all') {
            return $query->where('category', $category);
        }

        return $query;
    }

    /**
     * Scope for filtering by priority.
     */
    public function scopePriority($query, ?string $priority)
    {
        if ($priority && $priority !== 'all') {
            return $query->where('priority', $priority);
        }

        return $query;
    }
}
