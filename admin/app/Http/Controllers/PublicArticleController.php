<?php

namespace App\Http\Controllers;

use App\Models\Article;
use Illuminate\Http\Request;

class PublicArticleController extends Controller
{
    public function index(Request $request)
    {
        $query = Article::where('status', 'published')
            ->with(['author', 'category', 'tags']);

        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('slug', 'like', "%{$search}%")
                  ->orWhere('excerpt', 'like', "%{$search}%");
            });
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->get('category_id'));
        }

        return response()->json([
            'data' => $query->latest('published_at')->paginate(12),
        ]);
    }

    public function show($slug)
    {
        $article = Article::where('slug', $slug)
            ->where('status', 'published')
            ->with(['author', 'category', 'tags'])
            ->firstOrFail();

        return response()->json([
            'data' => $article,
        ]);
    }
}
