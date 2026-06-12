<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\Request;

class ActivityLogController extends Controller
{
    public function index(Request $request)
    {
        // Only super admin
        $this->authorize('viewActivityLogs');
        $query = ActivityLog::query()->latest();

        // Support queries against either schema (new: action/related_id, legacy: event/subject_id)
        if ($request->filled('action')) {
            $action = $request->string('action')->toString();
            $query->where(function ($q) use ($action) {
                $q->where('action', $action)->orWhere('event', $action);
            });
        }

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->integer('user_id'));
        }

        if ($request->filled('related_id')) {
            $id = $request->integer('related_id');
            $query->where(function ($q) use ($id) {
                $q->where('related_id', $id)->orWhere('subject_id', $id);
            });
        }

        $logs = $query->paginate(30);

        // Normalize payload for frontend: ensure common fields exist
        $logs->getCollection()->transform(function ($log) {
            // if legacy
            if (empty($log->action) && !empty($log->event)) {
                $log->action = $log->event;
            }

            if (empty($log->related_id) && !empty($log->subject_id)) {
                $log->related_id = $log->subject_id;
            }

            // properties -> old/new mapping
            if (empty($log->new_value) && !empty($log->properties)) {
                try {
                    $props = is_string($log->properties) ? json_decode($log->properties, true) : $log->properties;
                    $log->old_value = $props['old'] ?? null;
                    $log->new_value = $props['new'] ?? null;
                } catch (\Throwable $e) {
                    $log->old_value = null;
                    $log->new_value = null;
                }
            }

            // user display
            if (empty($log->user_name) && !empty($log->user_id)) {
                $log->user_name = optional(\App\Models\User::find($log->user_id))->name;
            }

            return $log;
        });

        return response()->json($logs);
    }
}
