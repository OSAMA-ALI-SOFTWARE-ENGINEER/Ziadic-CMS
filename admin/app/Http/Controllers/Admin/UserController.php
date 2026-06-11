<?php

namespace App\Http\Controllers\Admin;

use App\Models\User;
use App\Support\ActivityLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class UserController
{
    public function index(Request $request)
    {
        $query = User::orderByDesc('created_at');

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('search')) {
            $query->where('name', 'like', "%{$request->search}%")
                ->orWhere('email', 'like', "%{$request->search}%");
        }

        $perPage = (int) $request->input('per_page', 15);

        return response()->json(
            $query->paginate($perPage)
        );
    }

    public function show(User $user)
    {
        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'status' => $user->status,
            'email_verified_at' => $user->email_verified_at,
            'last_login_at' => $user->last_login_at,
            'created_at' => $user->created_at,
            'roles' => $user->getRoleNames()->toArray(),
        ]);
    }

    public function assignRole(Request $request, User $user)
    {
        Gate::authorize('isAdmin');

        $validated = $request->validate([
            'role' => 'required|string|exists:roles,name',
        ]);

        $oldRoles = $user->getRoleNames()->toArray();
        $user->syncRoles([$validated['role']]);

        ActivityLogger::log('user.updated', $user, [
            'old' => ['roles' => $oldRoles],
            'new' => ['roles' => $user->getRoleNames()->toArray()],
        ], $request);

        return response()->json([
            'message' => 'Role assigned successfully',
            'roles' => $user->getRoleNames()->toArray(),
        ]);
    }
}
