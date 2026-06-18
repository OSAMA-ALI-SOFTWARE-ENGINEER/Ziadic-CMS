<?php

namespace App\Http\Controllers\Admin;

use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\DB;

class RoleController
{
    public function index(Request $request)
    {
        Gate::authorize('isAdmin');

        $query = Role::query();

        if ($request->has('search') && $request->input('search')) {
            $search = $request->input('search');
            $query->where('name', 'like', "%{$search}%");
        }

        $query->withCount('users');

        $perPage = (int) $request->input('per_page', 20);

        $roles = $query->paginate($perPage);

        // Format the response to include proper permission counts
        $roles->getCollection()->transform(function ($role) {
            return [
                'id' => $role->id,
                'name' => $role->name,
                'permissions' => $role->permissions->pluck('name')->implode(','),
                'permission_count' => $role->permissions->count(),
                'user_count' => $role->users_count,
                'status' => 'active',
                'created_at' => $role->created_at?->toIso8601String(),
                'updated_at' => $role->updated_at?->toIso8601String(),
            ];
        });

        return response()->json($roles);
    }

    public function store(Request $request)
    {
        Gate::authorize('isAdmin');

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:roles,name',
            'permissions' => 'nullable|string',
            'status' => 'nullable|string|in:active,inactive,system',
        ]);

        try {
            $role = Role::create([
                'name' => $validated['name'],
                'guard_name' => 'web',
            ]);

            if (!empty($validated['permissions'])) {
                $permissions = array_filter(array_map('trim', explode(',', $validated['permissions'])));
                if (!empty($permissions)) {
                    $existingPermissions = Permission::whereIn('name', $permissions)->pluck('id')->toArray();
                    if (!empty($existingPermissions)) {
                        $role->syncPermissions($existingPermissions);
                    }
                }
            }

            return response()->json([
                'message' => 'Role created successfully',
                'data' => $this->formatRoleResponse($role),
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to create role: ' . $e->getMessage()], 500);
        }
    }

    public function show(Role $role)
    {
        Gate::authorize('isAdmin');

        return response()->json($this->formatRoleResponse($role));
    }

    public function update(Request $request, Role $role)
    {
        Gate::authorize('isAdmin');

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:roles,name,' . $role->id,
            'permissions' => 'nullable|string',
            'status' => 'nullable|string|in:active,inactive,system',
        ]);

        try {
            $role->update([
                'name' => $validated['name'],
            ]);

            if (isset($validated['permissions'])) {
                $permissions = array_filter(array_map('trim', explode(',', $validated['permissions'])));
                if (!empty($permissions)) {
                    $existingPermissions = Permission::whereIn('name', $permissions)->pluck('id')->toArray();
                    $role->syncPermissions($existingPermissions);
                } else {
                    $role->syncPermissions([]);
                }
            }

            return response()->json([
                'message' => 'Role updated successfully',
                'data' => $this->formatRoleResponse($role),
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to update role: ' . $e->getMessage()], 500);
        }
    }

    public function destroy(Request $request, Role $role)
    {
        Gate::authorize('isAdmin');

        // Prevent deletion of system roles
        if (in_array($role->name, ['super-admin', 'admin'])) {
            return response()->json(['message' => 'Cannot delete system roles'], 422);
        }

        try {
            // Check if role has users
            if ($role->users()->count() > 0) {
                return response()->json([
                    'message' => 'Cannot delete role that has users assigned. Please reassign users first.',
                    'user_count' => $role->users()->count(),
                ], 422);
            }

            $role->delete();

            return response()->json([
                'message' => 'Role deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to delete role: ' . $e->getMessage()], 500);
        }
    }

    public function getRolesList()
    {
        $roles = Role::all(['id', 'name'])->map(fn($role) => [
            'id' => $role->id,
            'name' => $role->name,
            'label' => ucfirst(str_replace('-', ' ', $role->name)),
        ]);

        return response()->json($roles);
    }

    public function getRolePermissions(Role $role)
    {
        $permissions = $role->permissions()->get(['id', 'name'])->map(fn($permission) => [
            'id' => $permission->id,
            'name' => $permission->name,
            'label' => ucfirst(str_replace('-', ' ', str_replace('_', ' ', $permission->name))),
        ]);

        return response()->json([
            'role' => [
                'id' => $role->id,
                'name' => $role->name,
            ],
            'permissions' => $permissions,
        ]);
    }

    private function formatRoleResponse(Role $role)
    {
        return [
            'id' => $role->id,
            'name' => $role->name,
            'permissions' => $role->permissions->pluck('name')->implode(', '),
            'user_count' => $role->users()->count(),
            'status' => 'active',
            'created_at' => $role->created_at?->toIso8601String(),
            'updated_at' => $role->updated_at?->toIso8601String(),
        ];
    }
}
