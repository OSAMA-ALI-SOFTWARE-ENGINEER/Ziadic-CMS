<?php

namespace App\Http\Controllers\Admin;

use App\Models\Setting;
use Illuminate\Http\Request;

class SettingController
{
    public function index()
    {
        $settings = Setting::all();

        $grouped = [];
        foreach ($settings as $setting) {
            if (!isset($grouped[$setting->group])) {
                $grouped[$setting->group] = [];
            }
            $grouped[$setting->group][$setting->key] = $setting->value;
        }

        return response()->json($grouped);
    }

    public function upsert(Request $request)
    {
        $validated = $request->validate([
            'settings' => 'required|array',
            'settings.*' => 'array',
            'settings.*.group' => 'required|string',
            'settings.*.key' => 'required|string',
            'settings.*.value' => 'nullable',
        ]);

        foreach ($validated['settings'] as $item) {
            Setting::updateOrCreate(
                ['group' => $item['group'], 'key' => $item['key']],
                ['value' => $item['value']]
            );
        }

        return response()->json(['message' => 'Settings updated successfully']);
    }
}
