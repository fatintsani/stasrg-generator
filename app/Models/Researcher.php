<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Researcher extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'role',
        'identifier',
        'lab_affiliation',
        'email',
        'avatar',
        'scholar_url',
        'scopus_url',
        'sinta_url',
        'orcid_url',
        'linkedin_url',
        'expertise',
        'bio',
        'is_active',
        'usage_count',
        'created_by',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'expertise' => 'array',
        'is_active' => 'boolean',
        'usage_count' => 'integer',
    ];

    /**
     * Appends for JSON serialization.
     *
     * @var list<string>
     */
    protected $appends = [
        'avatar_url',
    ];

    /**
     * Get the resolved public URL for the researcher avatar.
     */
    public function getAvatarUrlAttribute(): ?string
    {
        if (empty($this->avatar)) {
            return null;
        }

        if (str_starts_with($this->avatar, 'http://') || str_starts_with($this->avatar, 'https://') || str_starts_with($this->avatar, 'data:')) {
            return $this->avatar;
        }

        return asset('storage/'.ltrim($this->avatar, '/'));
    }

    /**
     * User who created the researcher record.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Scope for filtering by role.
     */
    public function scopeByRole(Builder $query, ?string $role): Builder
    {
        if (empty($role) || $role === 'all') {
            return $query;
        }

        return $query->where('role', $role);
    }

    /**
     * Scope for active researchers.
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for searching keyword in name, identifier, lab_affiliation, or expertise.
     */
    public function scopeSearch(Builder $query, ?string $keyword): Builder
    {
        if (empty($keyword)) {
            return $query;
        }

        return $query->where(function ($q) use ($keyword) {
            $q->where('name', 'like', "%{$keyword}%")
                ->orWhere('identifier', 'like', "%{$keyword}%")
                ->orWhere('lab_affiliation', 'like', "%{$keyword}%")
                ->orWhere('email', 'like', "%{$keyword}%")
                ->orWhere('role', 'like', "%{$keyword}%")
                ->orWhere('expertise', 'like', "%{$keyword}%");
        });
    }

    /**
     * Increment usage counter when used in projects.
     */
    public function incrementUsage(): void
    {
        $this->increment('usage_count');
    }
}
