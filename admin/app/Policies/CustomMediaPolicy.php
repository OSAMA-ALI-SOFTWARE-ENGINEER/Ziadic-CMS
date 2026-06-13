<?php

namespace App\Policies;

use App\Models\CustomMedia;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class CustomMediaPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasRole(['admin', 'editor', 'contributor']);
    }

    public function view(User $user, CustomMedia $customMedia): bool
    {
        return $user->hasRole(['admin', 'editor', 'contributor']);
    }

    public function create(User $user): bool
    {
        return $user->hasRole(['admin', 'editor', 'contributor']);
    }

    public function update(User $user, CustomMedia $customMedia): bool
    {
        return $user->hasRole(['admin', 'editor']) || $user->id === $customMedia->uploaded_by;
    }

    public function delete(User $user, CustomMedia $customMedia): bool
    {
        return $user->hasRole(['admin', 'editor']) || $user->id === $customMedia->uploaded_by;
    }

    public function bulkDelete(User $user): bool
    {
        return $user->hasRole(['admin', 'editor']);
    }

    public function restore(User $user, CustomMedia $customMedia): bool
    {
        return $user->hasRole('admin');
    }

    public function forceDelete(User $user, CustomMedia $customMedia): bool
    {
        return $user->hasRole('admin');
    }
}
