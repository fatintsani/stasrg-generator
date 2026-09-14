<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectAnalytic extends Model
{
    use HasFactory;

    public const EVENT_QR_SCAN = 'qr_scan';

    public const EVENT_SHOWCASE_VIEW = 'showcase_view';

    public const EVENT_DOWNLOAD_PNG = 'download_png';

    public const EVENT_DOWNLOAD_PDF = 'download_pdf';

    public const EVENT_PRINT_FLYER = 'print_flyer';

    protected $fillable = [
        'project_id',
        'event_type',
        'source',
        'ip_address',
        'user_agent',
        'device_type',
        'browser',
        'platform',
        'city',
        'country',
        'referrer',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Relationship to project.
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Scope for QR code scan events.
     */
    public function scopeQrScans(Builder $query): Builder
    {
        return $query->where('event_type', self::EVENT_QR_SCAN);
    }

    /**
     * Scope for showcase view events.
     */
    public function scopeShowcaseViews(Builder $query): Builder
    {
        return $query->where('event_type', self::EVENT_SHOWCASE_VIEW);
    }

    /**
     * Scope for export/download/print events.
     */
    public function scopeDownloads(Builder $query): Builder
    {
        return $query->whereIn('event_type', [
            self::EVENT_DOWNLOAD_PNG,
            self::EVENT_DOWNLOAD_PDF,
            self::EVENT_PRINT_FLYER,
        ]);
    }

    /**
     * Scope for filtering by date range.
     */
    public function scopeInDateRange(Builder $query, ?string $from = null, ?string $to = null): Builder
    {
        if ($from) {
            $query->whereDate('created_at', '>=', $from);
        }
        if ($to) {
            $query->whereDate('created_at', '<=', $to);
        }

        return $query;
    }

    /**
     * Scope for filtering by specific project.
     */
    public function scopeByProject(Builder $query, $projectId): Builder
    {
        if ($projectId && $projectId !== 'all') {
            $query->where('project_id', $projectId);
        }

        return $query;
    }
}
