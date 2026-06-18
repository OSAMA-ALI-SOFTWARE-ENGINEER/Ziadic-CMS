<?php

namespace App\Http\Controllers\Admin;

use App\Models\User;
use App\Support\ActivityLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

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

        $users = $query->paginate($perPage);

        // Add role information to each user
        $users->getCollection()->transform(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'status' => $user->status,
                'created_at' => $user->created_at,
                'role' => $user->getRoleNames()->first() ?? 'client',
            ];
        });

        return response()->json($users);
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

    public function updateProfile(Request $request)
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // Force reload user from database to ensure exists flag is set properly
        $user = User::find($user->id);
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|max:20',
            'bio' => 'nullable|string|max:500',
            'department' => 'nullable|string|max:255',
            'location' => 'nullable|string|max:255',
            'current_password' => 'nullable|string',
            'new_password' => 'nullable|string|min:6',
            'new_password_confirmation' => 'nullable|string',
            'profile_picture' => 'nullable|image|mimes:jpeg,png,gif,webp|max:5120',
        ]);

        // Validate password confirmation if changing password
        if (!empty($validated['new_password'])) {
            if (empty($validated['current_password'])) {
                return response()->json([
                    'message' => 'Current password is required to change password',
                ], 422);
            }

            if ($validated['new_password'] !== $validated['new_password_confirmation']) {
                return response()->json([
                    'message' => 'Passwords do not match',
                ], 422);
            }

            if (!Hash::check($validated['current_password'], $user->password)) {
                return response()->json([
                    'message' => 'Current password is incorrect',
                ], 422);
            }
        }

        // Prepare update data
        $updateData = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'bio' => $validated['bio'] ?? null,
            'department' => $validated['department'] ?? null,
            'location' => $validated['location'] ?? null,
        ];

        // Add password to update if provided
        if (!empty($validated['new_password'])) {
            $updateData['password'] = Hash::make($validated['new_password']);
        }

        // Handle profile picture upload
        $updatedFields = ['name', 'email'];

        if ($request->hasFile('profile_picture')) {
            try {
                // Delete old profile picture if exists
                if ($user->profile_picture && Storage::disk('public')->exists($user->profile_picture)) {
                    Storage::disk('public')->delete($user->profile_picture);
                }

                $path = $request->file('profile_picture')->store('profiles', 'public');
                $updateData['profile_picture'] = $path;
                $updatedFields[] = 'profile_picture';
            } catch (\Exception $e) {
                \Log::error('Failed to store profile picture', ['error' => $e->getMessage()]);
                return response()->json(['message' => 'Failed to upload profile picture'], 500);
            }
        }

        // Update the user - use save() instead of update() to ensure proper handling
        \Log::info('Before update - updateData:', $updateData);
        \Log::info('User model ID:', ['id' => $user->id, 'exists' => $user->exists]);

        try {
            // Apply the update data to the model
            foreach ($updateData as $key => $value) {
                $user->$key = $value;
            }
            $user->save();
            \Log::info('Save successful for user ' . $user->id);
        } catch (\Exception $e) {
            \Log::error('Save failed:', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to update profile: ' . $e->getMessage()], 500);
        }

        // Refresh to get the latest data from database
        $user->refresh();
        \Log::info('After refresh - user data from database:', [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'profile_picture' => $user->profile_picture,
            'updated_at' => $user->updated_at
        ]);

        if (!empty($validated['new_password'])) {
            $updatedFields[] = 'password';
        }

        ActivityLogger::log('user.profile_updated', $user, [
            'updated_fields' => $updatedFields,
        ], $request);

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'bio' => $user->bio,
                'department' => $user->department,
                'location' => $user->location,
                'profile_picture' => $user->profile_picture ? asset('storage/' . $user->profile_picture) : null,
                'role' => $user->getRoleNames()->first(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        Gate::authorize('isAdmin');

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'nullable|string|min:6',
            'role' => 'required|string|exists:roles,name',
            'status' => 'required|string|in:active,pending,suspended',
        ]);

        try {
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => $validated['password'] ? Hash::make($validated['password']) : Hash::make('password123'),
                'status' => $validated['status'],
            ]);

            if ($validated['role']) {
                $user->syncRoles([$validated['role']]);
            }

            ActivityLogger::log('user.created', $user, [
                'name' => $validated['name'],
                'email' => $validated['email'],
                'role' => $validated['role'],
                'status' => $validated['status'],
            ], $request);

            return response()->json([
                'message' => 'User created successfully',
                'data' => $this->formatUserResponse($user),
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to create user: ' . $e->getMessage()], 500);
        }
    }

    public function update(Request $request, User $user)
    {
        Gate::authorize('isAdmin');

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email,' . $user->id,
            'role' => 'required|string|exists:roles,name',
            'status' => 'required|string|in:active,pending,suspended',
            'password' => 'nullable|string|min:6',
        ]);

        try {
            $oldData = [
                'name' => $user->name,
                'email' => $user->email,
                'status' => $user->status,
                'role' => $user->getRoleNames()->first(),
            ];

            $updateData = [
                'name' => $validated['name'],
                'email' => $validated['email'],
                'status' => $validated['status'],
            ];

            if (!empty($validated['password'])) {
                $updateData['password'] = Hash::make($validated['password']);
            }

            $user->update($updateData);

            if ($validated['role']) {
                $user->syncRoles([$validated['role']]);
            }

            ActivityLogger::log('user.updated', $user, [
                'old' => $oldData,
                'new' => [
                    'name' => $validated['name'],
                    'email' => $validated['email'],
                    'status' => $validated['status'],
                    'role' => $validated['role'],
                ],
            ], $request);

            return response()->json([
                'message' => 'User updated successfully',
                'data' => $this->formatUserResponse($user),
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to update user: ' . $e->getMessage()], 500);
        }
    }

    public function destroy(Request $request, User $user)
    {
        Gate::authorize('isAdmin');

        // Prevent self-deletion
        if (auth()->id() === $user->id) {
            return response()->json(['message' => 'Cannot delete your own user account'], 422);
        }

        try {
            $userData = [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'status' => $user->status,
                'role' => $user->getRoleNames()->first(),
            ];

            ActivityLogger::log('user.deleted', $user, $userData, $request);

            $user->delete();

            return response()->json([
                'message' => 'User deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to delete user: ' . $e->getMessage()], 500);
        }
    }

    private function formatUserResponse(User $user)
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'status' => $user->status,
            'role' => $user->getRoleNames()->first() ?? 'client',
            'created_at' => $user->created_at->toIso8601String(),
            'updated_at' => $user->updated_at->toIso8601String(),
        ];
    }
}
