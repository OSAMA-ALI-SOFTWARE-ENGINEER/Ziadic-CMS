<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\Request;

class ActivityLogController extends Controller
{
    public function index(Request $request)
    {
        $query = ActivityLog::query()
            ->with('user:id,name,email')
            ->orderByDesc('created_at');

        if ($request->string('event')->isNotEmpty()) {
            $query->where('event', $request->string('event'));
        }

        if ($request->string('user_id')->isNotEmpty()) {
            $query->where('user_id', $request->integer('user_id'));
        }

        if ($request->string('search')->isNotEmpty()) {
            $search = $request->string('search')->toString();
            $query->where(function ($q) use ($search) {
                $q->where('subject_type', 'like', "%{$search}%")
                    ->orWhere('properties', 'like', "%{$search}%");
            });
        }

        return $query->paginate(50)->through(fn(ActivityLog $log) => [
            'id' => $log->id,
            'user_id' => $log->user_id,
            'user_name' => $log->user?->name,
            'event' => $log->event,
            'subject_type' => $log->subject_type,
            'subject_id' => $log->subject_id,
            'properties' => $log->properties,
            'ip_address' => $log->ip_address,
            'user_agent' => $log->user_agent,
            'created_at' => $log->created_at,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'action' => 'required|string|max:255',
            'model' => 'required|string|max:255',
            'model_id' => 'nullable|integer',
            'description' => 'nullable|string',
            'old_values' => 'nullable|array',
            'new_values' => 'nullable|array',
        ]);

        $log = ActivityLog::create([
            'user_id' => auth()->id(),
            'action' => $validated['action'],
            'model' => $validated['model'],
            'model_id' => $validated['model_id'],
            'description' => $validated['description'],
            'old_values' => $validated['old_values'] ?? null,
            'new_values' => $validated['new_values'] ?? null,
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'message' => 'Activity logged',
            'log' => $log,
        ], 201);
    }
}
