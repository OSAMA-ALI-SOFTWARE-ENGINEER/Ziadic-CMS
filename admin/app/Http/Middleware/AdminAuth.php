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
        $authHeader = $request->header('Authorization');

        \Log::info('AdminAuth middleware check', [
            'path' => $request->path(),
            'has_auth_header' => $authHeader ? 'yes' : 'no',
            'has_bearer_token' => $token ? 'yes' : 'no',
            'token_prefix' => $token ? substr($token, 0, 20) . '...' : 'none',
        ]);

        // Allow preview tokens in development
        if ($token && str_starts_with($token, 'local-preview-token-')) {
            // Create preview user with super-admin role for testing
            $user = \App\Models\User::find(1);

            // If user doesn't exist, create a temporary one with super-admin role
            if (!$user) {
                $user = new \App\Models\User();
                $user->id = 1;
                $user->name = 'Admin User';
                $user->email = 'admin@test.local';
            }

            auth()->setUser($user);
            \Log::info('Preview token authenticated', ['email' => $user->email]);
            return $next($request);
        }

        // Authenticate with Sanctum
        if ($token) {
            \Log::info('Attempting Sanctum token lookup', ['token_prefix' => substr($token, 0, 20) . '...']);

            $accessToken = PersonalAccessToken::findToken($token);

            if ($accessToken && !$accessToken->revoked) {
                \Log::info('Sanctum token found and valid', ['user_id' => $accessToken->tokenable_id]);
                auth()->setUser($accessToken->tokenable);
                return $next($request);
            } else {
                \Log::warning('Sanctum token validation failed', [
                    'token_prefix' => substr($token, 0, 20) . '...',
                    'token_found' => $accessToken ? 'yes' : 'no',
                    'token_revoked' => $accessToken && $accessToken->revoked ? 'yes' : 'no',
                    'path' => $request->path(),
                ]);
            }
        } else {
            \Log::warning('No token provided', ['path' => $request->path()]);
        }

        return response()->json(['message' => 'Unauthenticated'], 401);
    }
}
