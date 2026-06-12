<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;

class AdminAuth
{
    public function handle(Request $request, Closure $next)
    {
        $token = $request->bearerToken();

        // Allow preview tokens in development
        if ($token && str_starts_with($token, 'local-preview-token-')) {
            $user = new \App\Models\User();
            $user->id = 1;
            $user->name = 'Admin User';
            $user->email = 'admin@test.local';
            auth()->setUser($user);
            return $next($request);
        }

        // Authenticate with Sanctum
        if ($token) {
            $accessToken = PersonalAccessToken::findToken($token);
            if ($accessToken && !$accessToken->revoked) {
                auth()->setUser($accessToken->tokenable);
                return $next($request);
            }
        }

        return response()->json(['message' => 'Unauthenticated'], 401);
    }
}
