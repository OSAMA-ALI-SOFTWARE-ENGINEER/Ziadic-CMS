<?php

namespace App\Http\Controllers\Admin;

use App\Models\ContactMessage;
use Illuminate\Http\Request;

class ContactMessageController
{
    public function index(Request $request)
    {
        $query = ContactMessage::orderByDesc('created_at');

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('search')) {
            $query->where('name', 'like', "%{$request->search}%")
                ->orWhere('email', 'like', "%{$request->search}%")
                ->orWhere('subject', 'like', "%{$request->search}%");
        }

        $perPage = (int) $request->input('per_page', 15);

        return response()->json(
            $query->with('assignee:id,name')->paginate($perPage)
        );
    }

    public function updateStatus(Request $request, ContactMessage $message)
    {
        $validated = $request->validate([
            'status' => 'required|in:new,read,resolved',
            'assigned_to' => 'nullable|exists:users,id',
        ]);

        $message->update($validated);

        return response()->json(['message' => 'Status updated successfully']);
    }
}
