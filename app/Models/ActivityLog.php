<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class ActivityLog extends Model
{
    use HasFactory;

    public const TYPE_AUTH = 'auth';

    public const TYPE_PROJECT = 'project';

    public const TYPE_USER = 'user';

    public const TYPE_EXPORT = 'export';

    public const TYPE_SYSTEM = 'system';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'log_type',
        'action',
        'description',
        'subject_type',
        'subject_id',
        'properties',
        'ip_address',
        'user_agent',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'properties' => 'array',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    /**
     * The user who performed this activity.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Polymorphic subject model (Project, User, etc.).
     */
    public function subject(): MorphTo
    {
        return $this->morphTo();
    }
}
