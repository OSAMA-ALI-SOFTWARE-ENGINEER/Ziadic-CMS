<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Country;
use Illuminate\Http\Request;

class CountryController extends Controller
{
    public function index(Request $request)
    {
        return Country::query()
            ->withCount(['cities as places_count' => fn($q) => $q->whereHas('listings', fn($q) => $q->where('status', 'published'))])
            ->orderBy('name')
            ->paginate($request->input('per_page', 15));
    }

    public function show(Country $country)
    {
        return $country->loadCount(['cities as places_count' => fn($q) => $q->whereHas('listings', fn($q) => $q->where('status', 'published'))]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:countries',
            'iso2' => 'nullable|string|max:2',
            'iso3' => 'nullable|string|max:3',
        ]);

        return Country::create($validated);
    }

    public function update(Request $request, Country $country)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:countries,name,' . $country->id,
            'iso2' => 'nullable|string|max:2',
            'iso3' => 'nullable|string|max:3',
        ]);

        $country->update($validated);
        return $country;
    }

    public function destroy(Country $country)
    {
        $country->delete();
        return response()->json(['message' => 'Country deleted']);
    }
}
