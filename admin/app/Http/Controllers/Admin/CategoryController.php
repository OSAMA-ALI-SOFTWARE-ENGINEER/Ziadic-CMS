<?php

namespace App\Http\Controllers\Admin;

use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController
{
    public function index(Request $request)
    {
        $query = Category::withCount('listings')->orderBy('sort_order')->orderBy('name');

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
            'slug' => 'required|string|unique:categories',
            'type' => 'in:listing,post|default:listing',
            'parent_id' => 'nullable|exists:categories,id',
            'description' => 'nullable|string',
            'icon' => 'nullable|string',
            'sort_order' => 'nullable|integer',
            'is_active' => 'boolean|default:true',
            'seo_title' => 'nullable|string',
            'seo_description' => 'nullable|string',
            'seo_keywords' => 'nullable|string',
        ]);

        $category = Category::create($validated);

        return response()->json($category, 201);
    }

    public function show(Category $category)
    {
        return response()->json($category->loadCount('listings'));
    }

    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name' => 'string|max:255',
            'slug' => 'string|unique:categories,slug,' . $category->id,
            'type' => 'in:listing,post',
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

        return response()->json($category);
    }

    public function destroy(Category $category)
    {
        $category->delete();
        return response()->noContent();
    }
}
