<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class AdminSettingsController extends Controller
{
    private $settingsCache = 'admin.settings.';
    private $cacheTime = 60 * 60 * 24;

    public function show(Request $request, $section)
    {
        $cacheKey = $this->settingsCache . $section;
        $settings = Cache::get($cacheKey, []);

        return response()->json([
            'section' => $section,
            'data' => $settings,
        ]);
    }

    public function update(Request $request, $section)
    {
        $data = $request->all();
        $cacheKey = $this->settingsCache . $section;

        Cache::put($cacheKey, $data, $this->cacheTime);

        return response()->json([
            'message' => ucfirst($section) . ' settings saved successfully',
            'section' => $section,
            'data' => $data,
        ]);
    }
}
