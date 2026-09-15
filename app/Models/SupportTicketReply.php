<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SupportTicketReply extends Model
{
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'support_ticket_id',
        'user_id',
        'sender_type',
        'sender_name',
        'message',
        'attachment_path',
        'attachment_original_name',
        'attachment_size',
        'status_at_reply',
        'is_sent_to_user',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_sent_to_user' => 'boolean',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    /**
     * The support ticket this reply belongs to.
     */
    public function ticket(): BelongsTo
    {
        return $this->belongsTo(SupportTicket::class, 'support_ticket_id');
    }

    /**
     * The admin user who wrote this reply (if admin).
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Check if reply was sent by an admin.
     */
    public function isAdmin(): bool
    {
        return $this->sender_type === 'admin' || $this->user_id !== null;
    }

    /**
     * Check if reply was sent by the ticket author/user.
     */
    public function isUser(): bool
    {
        return $this->sender_type === 'user';
    }
}
