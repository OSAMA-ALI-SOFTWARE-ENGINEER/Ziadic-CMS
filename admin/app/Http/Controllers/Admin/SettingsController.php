<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\OAuthSetting;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    /**
     * Get OAuth Settings
     */
    public function getOAuth()
    {
        $settings = OAuthSetting::first();

        if (!$settings) {
            return response()->json([
                'oauth_enabled' => false,
                'google_client_id' => '',
                'google_client_secret' => '',
                'google_redirect_uri' => 'https://admin.kukaqka.com/auth/callback/google',
                'facebook_app_id' => '',
                'facebook_app_secret' => '',
                'facebook_redirect_uri' => 'https://admin.kukaqka.com/auth/callback/facebook',
            ]);
        }

        return response()->json($settings);
    }

    /**
     * Store OAuth Settings
     */
    public function storeOAuth(Request $request)
    {
        $validated = $request->validate([
            'oauth_enabled' => 'boolean',
            'google_client_id' => 'nullable|string',
            'google_client_secret' => 'nullable|string',
            'google_redirect_uri' => 'nullable|url',
            'facebook_app_id' => 'nullable|string',
            'facebook_app_secret' => 'nullable|string',
            'facebook_redirect_uri' => 'nullable|url',
        ]);

        $settings = OAuthSetting::first();

        if ($settings) {
            $settings->update($validated);
        } else {
            $settings = OAuthSetting::create($validated);
        }

        return response()->json([
            'message' => 'OAuth settings updated successfully',
            'data' => $settings,
        ]);
    }
}
