<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class ActivityLogger
{
    /**
     * Record a general activity log entry.
     *
     * @param  array<string, mixed>  $properties
     */
    public static function log(
        string $action,
        string $type,
        string $description,
        ?Model $subject = null,
        array $properties = [],
        ?User $user = null,
        ?Request $request = null
    ): ?ActivityLog {
        try {
            $req = $request ?: request();
            $currentUser = $user ?: Auth::user();

            return ActivityLog::create([
                'user_id' => $currentUser?->id,
                'log_type' => $type,
                'action' => $action,
                'description' => $description,
                'subject_type' => $subject ? get_class($subject) : null,
                'subject_id' => $subject?->getKey(),
                'properties' => ! empty($properties) ? $properties : null,
                'ip_address' => $req?->ip(),
                'user_agent' => $req ? substr((string) $req->userAgent(), 0, 500) : null,
            ]);
        } catch (\Throwable $e) {
            Log::warning('Failed to record activity log: '.$e->getMessage(), [
                'action' => $action,
                'type' => $type,
            ]);

            return null;
        }
    }

    /**
     * Record an authentication & security log entry.
     *
     * @param  array<string, mixed>  $properties
     */
    public static function logAuth(
        string $action,
        string $description,
        ?User $user = null,
        array $properties = [],
        ?Request $request = null
    ): ?ActivityLog {
        return self::log(
            action: $action,
            type: ActivityLog::TYPE_AUTH,
            description: $description,
            subject: $user,
            properties: $properties,
            user: $user,
            request: $request
        );
    }

    /**
     * Record a project lifecycle / changes log entry.
     *
     * @param  array<string, mixed>  $properties
     */
    public static function logProject(
        string $action,
        string $description,
        ?Project $project = null,
        array $properties = [],
        ?User $user = null,
        ?Request $request = null
    ): ?ActivityLog {
        return self::log(
            action: $action,
            type: ActivityLog::TYPE_PROJECT,
            description: $description,
            subject: $project,
            properties: $properties,
            user: $user,
            request: $request
        );
    }

    /**
     * Record a user management & approval log entry.
     *
     * @param  array<string, mixed>  $properties
     */
    public static function logUser(
        string $action,
        string $description,
        ?User $subjectUser = null,
        array $properties = [],
        ?User $actor = null,
        ?Request $request = null
    ): ?ActivityLog {
        return self::log(
            action: $action,
            type: ActivityLog::TYPE_USER,
            description: $description,
            subject: $subjectUser,
            properties: $properties,
            user: $actor,
            request: $request
        );
    }

    /**
     * Record an export / print flyer log entry.
     *
     * @param  array<string, mixed>  $properties
     */
    public static function logExport(
        string $action,
        string $description,
        ?Project $project = null,
        array $properties = [],
        ?User $user = null,
        ?Request $request = null
    ): ?ActivityLog {
        return self::log(
            action: $action,
            type: ActivityLog::TYPE_EXPORT,
            description: $description,
            subject: $project,
            properties: $properties,
            user: $user,
            request: $request
        );
    }

    /**
     * Record a system & maintenance operation log entry.
     *
     * @param  array<string, mixed>  $properties
     */
    public static function logSystem(
        string $action,
        string $description,
        array $properties = [],
        ?User $user = null,
        ?Request $request = null
    ): ?ActivityLog {
        return self::log(
            action: $action,
            type: ActivityLog::TYPE_SYSTEM,
            description: $description,
            subject: null,
            properties: $properties,
            user: $user,
            request: $request
        );
    }
}
