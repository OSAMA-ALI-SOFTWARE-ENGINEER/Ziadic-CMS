<?php

namespace App\Support;

use App\Models\ActivityLog;
use Illuminate\Http\Request;

class ActivityLogger
{
    /**
     * Log an activity.
     *
     * @param string $action
     * @param mixed $subject  Model or null
     * @param array $changes
     * @param Request|null $request
     * @return ActivityLog
     */
    public static function log(string $action, $subject = null, array $changes = [], ?Request $request = null)
    {
        $user = null;
        if ($request && $request->user()) {
            $user = $request->user();
        } elseif (auth()->check()) {
            $user = auth()->user();
        }

        $relatedType = null;
        $relatedId = null;
        if (is_object($subject) && method_exists($subject, 'getKey')) {
            $relatedType = get_class($subject);
            $relatedId = $subject->getKey();
        }

        $roleNames = null;
        try {
            if ($user && method_exists($user, 'getRoleNames')) {
                $roleNames = implode(',', $user->getRoleNames()->toArray() ?? []);
            }
        } catch (\Throwable $e) {
            $roleNames = null;
        }

        // Build data payload depending on DB schema (support older/new schemas)
        $data = [];
        // prefer new schema fields if present
        if (\Illuminate\Support\Facades\Schema::hasColumn('activity_logs', 'action')) {
            $data['action'] = $action;
            $data['user_id'] = $user ? $user->getKey() : null;
            // only set these columns if they exist in the legacy table
            if (\Illuminate\Support\Facades\Schema::hasColumn('activity_logs', 'user_name')) {
                $data['user_name'] = $user ? ($user->name ?? $user->email ?? null) : null;
            }
            if (\Illuminate\Support\Facades\Schema::hasColumn('activity_logs', 'user_role')) {
                $data['user_role'] = $roleNames;
            }
            $data['related_id'] = $relatedId;
            $data['related_type'] = $relatedType;
            $data['old_value'] = $changes['old'] ?? null;
            $data['new_value'] = $changes['new'] ?? null;
            $data['ip_address'] = $request ? $request->ip() : (request()->ip() ?? null);
        } else {
            // fallback to older schema used in this project
            $data['event'] = $action;
            $data['user_id'] = $user ? $user->getKey() : null;
            $data['user_name'] = $user ? ($user->name ?? $user->email ?? null) : null;
            $data['user_role'] = $roleNames;
            $data['subject_type'] = $relatedType;
            $data['subject_id'] = $relatedId;
            $properties = [];
            if (isset($changes['old'])) {
                $properties['old'] = $changes['old'];
            }
            if (isset($changes['new'])) {
                $properties['new'] = $changes['new'];
            }
            // include causer details in properties for legacy consumers
            if ($user) {
                $properties['causer_id'] = $user->getKey();
                $properties['causer_name'] = $user->name ?? $user->email ?? null;
                $properties['causer_role'] = $roleNames;
            }
            $data['properties'] = $properties ? json_encode($properties) : null;
            $data['ip_address'] = $request ? $request->ip() : (request()->ip() ?? null);
            try {
                $data['user_agent'] = $request ? $request->userAgent() : (request()->userAgent() ?? null);
            } catch (\Throwable $_) {
                $data['user_agent'] = null;
            }
        }

        // Ensure we only pass columns that actually exist in the activity_logs table
        try {
            $columns = \Illuminate\Support\Facades\Schema::getColumnListing('activity_logs');
            $data = array_intersect_key($data, array_flip($columns));
        } catch (\Throwable $_) {
            // if schema can't be read for any reason, fall back to original data
        }

        $log = ActivityLog::create($data);

        // Broadcast event for real-time UI updates if broadcasting is configured
        try {
            $payload = [
                'id' => $log->id,
                'action' => $log->action ?? $log->event ?? null,
                'related_id' => $log->related_id ?? $log->subject_id ?? null,
                'properties' => $log->new_value ?? ($log->properties ?? null),
                'created_at' => $log->created_at->toDateTimeString(),
            ];

            event(new \App\Events\ActivityLogged($payload));
        } catch (\Throwable $e) {
            // ignore if broadcasting not configured
        }

        return $log;
    }
}
