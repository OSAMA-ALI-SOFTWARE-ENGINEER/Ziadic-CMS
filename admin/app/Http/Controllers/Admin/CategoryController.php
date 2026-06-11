<?php

namespace App\Http\Controllers\Admin;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CategoryController
{
    public function index(Request $request)
    {
        $query = Category::with('parent:id,name')
            ->withCount('listings')
            ->orderBy('sort_order')
            ->orderBy('name');

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('search')) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        $perPage = (int) $request->input('per_page', 50);

        return response()->json(
            $query->paginate($perPage)
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => [
                'required',
                'string',
                Rule::unique('categories', 'slug')->where(fn ($query) => $query->where('type', $request->input('type', 'listing'))),
            ],
            'type' => ['nullable', Rule::in(['listing', 'post'])],
            'parent_id' => 'nullable|exists:categories,id',
            'description' => 'nullable|string',
            'icon' => 'nullable|string',
            'sort_order' => 'nullable|integer',
            'is_active' => 'boolean',
            'seo_title' => 'nullable|string',
            'seo_description' => 'nullable|string',
            'seo_keywords' => 'nullable|string',
        ]);

        $validated['type'] = $validated['type'] ?? 'listing';
        $validated['is_active'] = $validated['is_active'] ?? true;

        $category = Category::create($validated);

        return response()->json($category->load('parent:id,name')->loadCount('listings'), 201);
    }

    public function show(Category $category)
    {
        return response()->json($category->load('parent:id,name')->loadCount('listings'));
    }

    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name' => 'string|max:255',
            'slug' => [
                'string',
                Rule::unique('categories', 'slug')
                    ->ignore($category->id)
                    ->where(fn ($query) => $query->where('type', $request->input('type', $category->type))),
            ],
            'type' => ['nullable', Rule::in(['listing', 'post'])],
            'parent_id' => 'nullable|exists:categories,id',
            'description' => 'nullable|string',
            'icon' => 'nullable|string',
            'sort_order' => 'nullable|integer',
            'is_active' => 'boolean',
            'seo_title' => 'nullable|string',
            'seo_description' => 'nullable|string',
            'seo_keywords' => 'nullable|string',
        ]);

        $category->update($validated);

        return response()->json($category->load('parent:id,name')->loadCount('listings'));
    }

    public function destroy(Category $category)
    {
        $category->delete();
        return response()->noContent();
    }
}
