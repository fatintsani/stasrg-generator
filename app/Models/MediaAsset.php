<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MediaAsset extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'type',
        'category',
        'file_path',
        'preview_url',
        'svg_content',
        'tags',
        'is_verified',
        'is_system_preset',
        'usage_count',
        'created_by',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'tags' => 'array',
        'is_verified' => 'boolean',
        'is_system_preset' => 'boolean',
        'usage_count' => 'integer',
    ];

    /**
     * Appends for JSON serialization.
     *
     * @var list<string>
     */
    protected $appends = [
        'resolved_url',
    ];

    /**
     * Get the resolved public URL for the media asset.
     */
    public function getResolvedUrlAttribute(): string
    {
        if (! empty($this->file_path)) {
            return asset('storage/'.$this->file_path);
        }

        if (! empty($this->preview_url)) {
            return $this->preview_url;
        }

        if (! empty($this->svg_content)) {
            return 'data:image/svg+xml;utf8,'.rawurlencode($this->svg_content);
        }

        return '';
    }

    /**
     * User who uploaded the asset.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Scope for filtering by type (partner_logo, badge_icon).
     */
    public function scopeByType(Builder $query, ?string $type): Builder
    {
        if (empty($type) || $type === 'all') {
            return $query;
        }

        return $query->where('type', $type);
    }

    /**
     * Scope for filtering by category.
     */
    public function scopeByCategory(Builder $query, ?string $category): Builder
    {
        if (empty($category) || $category === 'all') {
            return $query;
        }

        return $query->where('category', $category);
    }

    /**
     * Scope for search keyword in name, category, or tags.
     */
    public function scopeSearch(Builder $query, ?string $keyword): Builder
    {
        if (empty($keyword)) {
            return $query;
        }

        return $query->where(function ($q) use ($keyword) {
            $q->where('name', 'like', "%{$keyword}%")
                ->orWhere('category', 'like', "%{$keyword}%")
                ->orWhere('tags', 'like', "%{$keyword}%");
        });
    }

    /**
     * Scope for verified assets.
     */
    public function scopeVerified(Builder $query): Builder
    {
        return $query->where('is_verified', true);
    }
}
