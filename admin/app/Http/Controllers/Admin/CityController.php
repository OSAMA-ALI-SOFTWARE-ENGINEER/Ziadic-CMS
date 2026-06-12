<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\City;
use Illuminate\Http\Request;

class CityController extends Controller
{
    public function index(Request $request)
    {
        return City::query()
            ->with('country:id,name,iso2')
            ->withCount(['listings as places_count' => fn($q) => $q->where('status', 'published')])
            ->orderBy('name')
            ->paginate($request->input('per_page', 15));
    }

    public function show(City $city)
    {
        return $city->load('country:id,name,iso2')
            ->loadCount(['listings as places_count' => fn($q) => $q->where('status', 'published')]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:cities',
            'country' => 'nullable|string',
        ]);

        return City::create($validated);
    }

    public function update(Request $request, City $city)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:cities,name,' . $city->id,
            'country' => 'nullable|string',
        ]);

        $city->update($validated);
        return $city;
    }

    public function destroy(City $city)
    {
        $city->delete();
        return response()->json(['message' => 'City deleted']);
    }
}
