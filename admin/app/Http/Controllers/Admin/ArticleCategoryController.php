<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ArticleCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ArticleCategoryController extends Controller
{
    public function index()
    {
        return response()->json([
            'data' => ArticleCategory::withCount('articles')->paginate(20),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:article_categories',
            'description' => 'nullable|string',
        ]);

        $category = ArticleCategory::create([
            ...$validated,
            'slug' => Str::slug($validated['name']),
        ]);

        return response()->json([
            'message' => 'Category created successfully',
            'data' => $category,
        ], 201);
    }

    public function show(ArticleCategory $articleCategory)
    {
        return response()->json([
            'data' => $articleCategory->load('articles'),
        ]);
    }

    public function update(Request $request, ArticleCategory $articleCategory)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:article_categories,name,' . $articleCategory->id,
            'description' => 'nullable|string',
        ]);

        $articleCategory->update($validated);

        return response()->json([
            'message' => 'Category updated successfully',
            'data' => $articleCategory,
        ]);
    }

    public function destroy(ArticleCategory $articleCategory)
    {
        $articleCategory->delete();
        return response()->json(['message' => 'Category deleted successfully']);
    }
}
