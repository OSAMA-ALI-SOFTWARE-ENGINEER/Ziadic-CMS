<?php

namespace App\Http\Controllers\Auth;

use App\Models\User;
use App\Support\ActivityLogger;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Validation\ValidationException;
use Spatie\Permission\Models\Role;

class AuthController
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $email = (string) $request->input('email');
        $password = (string) $request->input('password');

        $user = User::where('email', $email)->first();

        if (!$user || !password_verify($password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $user->update(['last_login_at' => now()]);

        $token = $user->createToken('api-token')->plainTextToken;

        ActivityLogger::log('admin.login', $user, [], $request);

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'bio' => $user->bio,
                'department' => $user->department,
                'location' => $user->location,
                'status' => $user->status,
                'profile_picture' => $user->profile_picture ? asset('storage/' . $user->profile_picture) : null,
                'role' => $user->getRoleNames()->first(),
                'roles' => $user->getRoleNames()->toArray(),
                'permissions' => $user->getAllPermissions()->pluck('name')->toArray(),
            ],
            'token' => $token,
        ]);
    }

    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'phone' => 'nullable|string|max:20',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::create([
            'name' => (string) $request->input('name'),
            'email' => (string) $request->input('email'),
            'phone' => $request->input('phone'),
            'password' => bcrypt((string) $request->input('password')),
            'status' => 'active',
        ]);

        // Assign user role (create if doesn't exist)
        try {
            $userRole = Role::where('name', 'user')->first();
            if (!$userRole) {
                $userRole = Role::create(['name' => 'user', 'guard_name' => 'web']);
            }
            $user->assignRole($userRole);
        } catch (\Exception $e) {
            \Log::warning('Failed to assign user role during registration', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
        }

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'status' => $user->status,
                'roles' => $user->getRoleNames()->toArray(),
                'permissions' => $user->getAllPermissions()->pluck('name')->toArray(),
            ],
            'token' => $token,
        ], Response::HTTP_CREATED);
    }

    public function logout(Request $request)
    {
        ActivityLogger::log('admin.logout', $request->user(), [], $request);

        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }

    public function me(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'bio' => $user->bio,
            'department' => $user->department,
            'location' => $user->location,
            'status' => $user->status,
            'profile_picture' => $user->profile_picture ? asset('storage/' . $user->profile_picture) : null,
            'role' => $user->getRoleNames()->first(),
            'roles' => $user->getRoleNames()->toArray(),
            'permissions' => $user->getAllPermissions()->pluck('name')->toArray(),
        ]);
    }

    /**
     * Redirect to Google OAuth
     */
    public function redirectToGoogle()
    {
        try {
            return redirect()->away(
                'https://accounts.google.com/o/oauth2/v2/auth?' . http_build_query([
                    'client_id' => config('services.google.client_id'),
                    'redirect_uri' => config('services.google.redirect'),
                    'response_type' => 'code',
                    'scope' => 'openid email profile',
                    'state' => session()->regenerate() ?: '',
                ])
            );
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'OAuth is not configured',
                'error' => $e->getMessage(),
            ], 403);
        }
    }

    /**
     * Handle Google OAuth Callback
     */
    public function handleGoogleCallback(Request $request)
    {
        try {
            $code = $request->input('code');

            if (!$code) {
                return response()->json([
                    'message' => 'Authorization code not found',
                ], 400);
            }

            // Exchange code for token
            $response = \Http::post('https://oauth2.googleapis.com/token', [
                'client_id' => config('services.google.client_id'),
                'client_secret' => config('services.google.client_secret'),
                'code' => $code,
                'grant_type' => 'authorization_code',
                'redirect_uri' => config('services.google.redirect'),
            ]);

            if (!$response->successful()) {
                return response()->json([
                    'message' => 'Failed to exchange authorization code',
                ], 400);
            }

            $accessToken = $response->json('access_token');

            // Get user info
            $userResponse = \Http::withToken($accessToken)
                ->get('https://www.googleapis.com/oauth2/v1/userinfo');

            if (!$userResponse->successful()) {
                return response()->json([
                    'message' => 'Failed to get user information',
                ], 400);
            }

            $googleUser = $userResponse->json();

            // Find or create user
            $user = User::where('email', $googleUser['email'])->first();

            if (!$user) {
                $user = User::create([
                    'name' => $googleUser['name'] ?? 'Google User',
                    'email' => $googleUser['email'],
                    'password' => bcrypt(str_random(16)),
                    'email_verified_at' => now(),
                    'status' => 'active',
                ]);

                try {
                    $userRole = Role::where('name', 'user')->first();
                    if (!$userRole) {
                        $userRole = Role::create(['name' => 'user', 'guard_name' => 'web']);
                    }
                    $user->assignRole($userRole);
                } catch (\Exception $e) {
                    \Log::warning('Failed to assign user role in Google OAuth', [
                        'user_id' => $user->id,
                        'error' => $e->getMessage(),
                    ]);
                }
            }

            $token = $user->createToken('oauth-token')->plainTextToken;

            ActivityLogger::log('oauth.google_login', $user, ['provider' => 'google'], $request);

            return response()->json([
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'bio' => $user->bio,
                    'status' => $user->status,
                    'role' => $user->getRoleNames()->first(),
                    'roles' => $user->getRoleNames()->toArray(),
                    'permissions' => $user->getAllPermissions()->pluck('name')->toArray(),
                ],
                'token' => $token,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Authentication failed',
                'error' => $e->getMessage(),
            ], 401);
        }
    }

    /**
     * Redirect to Facebook OAuth
     */
    public function redirectToFacebook()
    {
        try {
            return redirect()->away(
                'https://www.facebook.com/v12.0/dialog/oauth?' . http_build_query([
                    'client_id' => config('services.facebook.client_id'),
                    'redirect_uri' => config('services.facebook.redirect'),
                    'scope' => 'email,public_profile',
                    'state' => session()->regenerate() ?: '',
                ])
            );
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'OAuth is not configured',
                'error' => $e->getMessage(),
            ], 403);
        }
    }

    /**
     * Handle Facebook OAuth Callback
     */
    public function handleFacebookCallback(Request $request)
    {
        try {
            $code = $request->input('code');

            if (!$code) {
                return response()->json([
                    'message' => 'Authorization code not found',
                ], 400);
            }

            // Exchange code for token
            $response = \Http::get('https://graph.facebook.com/v12.0/oauth/access_token', [
                'client_id' => config('services.facebook.client_id'),
                'client_secret' => config('services.facebook.client_secret'),
                'code' => $code,
                'redirect_uri' => config('services.facebook.redirect'),
            ]);

            if (!$response->successful()) {
                return response()->json([
                    'message' => 'Failed to exchange authorization code',
                ], 400);
            }

            $accessToken = $response->json('access_token');

            // Get user info
            $userResponse = \Http::withToken($accessToken)
                ->get('https://graph.facebook.com/me', [
                    'fields' => 'id,name,email,picture',
                ]);

            if (!$userResponse->successful()) {
                return response()->json([
                    'message' => 'Failed to get user information',
                ], 400);
            }

            $facebookUser = $userResponse->json();

            // Find or create user
            $user = User::where('email', $facebookUser['email'])->first();

            if (!$user) {
                $user = User::create([
                    'name' => $facebookUser['name'] ?? 'Facebook User',
                    'email' => $facebookUser['email'],
                    'password' => bcrypt(str_random(16)),
                    'email_verified_at' => now(),
                    'status' => 'active',
                ]);

                try {
                    $userRole = Role::where('name', 'user')->first();
                    if (!$userRole) {
                        $userRole = Role::create(['name' => 'user', 'guard_name' => 'web']);
                    }
                    $user->assignRole($userRole);
                } catch (\Exception $e) {
                    \Log::warning('Failed to assign user role in Facebook OAuth', [
                        'user_id' => $user->id,
                        'error' => $e->getMessage(),
                    ]);
                }
            }

            $token = $user->createToken('oauth-token')->plainTextToken;

            ActivityLogger::log('oauth.facebook_login', $user, ['provider' => 'facebook'], $request);

            return response()->json([
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'bio' => $user->bio,
                    'status' => $user->status,
                    'role' => $user->getRoleNames()->first(),
                    'roles' => $user->getRoleNames()->toArray(),
                    'permissions' => $user->getAllPermissions()->pluck('name')->toArray(),
                ],
                'token' => $token,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Authentication failed',
                'error' => $e->getMessage(),
            ], 401);
        }
    }
}
