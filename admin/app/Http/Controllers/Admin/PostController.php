<?php

namespace App\Http\Controllers\Admin;

use App\Models\Post;
use Illuminate\Http\Request;

class PostController
{
    public function index(Request $request)
    {
        $query = Post::with(['author:id,name', 'category:id,name', 'tags:id,name'])
            ->orderByDesc('created_at');

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('search')) {
            $query->where('title', 'like', "%{$request->search}%");
        }

        $perPage = (int) $request->input('per_page', 15);

        return response()->json(
            $query->paginate($perPage)
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|unique:posts',
            'excerpt' => 'nullable|string',
            'content' => 'nullable|string',
            'category_id' => 'nullable|exists:categories,id',
            'status' => 'in:draft,published|default:draft',
            'tags' => 'nullable|array',
            'tags.*' => 'exists:tags,id',
            'seo_title' => 'nullable|string',
            'seo_description' => 'nullable|string',
            'seo_keywords' => 'nullable|string',
        ]);

        $userId = $request->user()?->getAuthIdentifier();
        abort_unless($userId, 401);

        $validated['author_id'] = $userId;
        $validated['slug'] = $validated['slug'] ?? str($validated['title'])->slug();

        $post = Post::create($validated);

        if (!empty($validated['tags'])) {
            $post->tags()->sync($validated['tags']);
        }

        return response()->json($post->load(['author:id,name', 'category:id,name', 'tags:id,name']), 201);
    }

    public function show(Post $post)
    {
        return response()->json(
            $post->load(['author:id,name', 'category:id,name', 'tags:id,name'])
        );
    }

    public function update(Request $request, Post $post)
    {
        $validated = $request->validate([
            'title' => 'string|max:255',
            'slug' => 'string|unique:posts,slug,' . $post->id,
            'excerpt' => 'nullable|string',
            'content' => 'nullable|string',
            'category_id' => 'nullable|exists:categories,id',
            'status' => 'in:draft,published',
            'tags' => 'nullable|array',
            'tags.*' => 'exists:tags,id',
            'seo_title' => 'nullable|string',
            'seo_description' => 'nullable|string',
            'seo_keywords' => 'nullable|string',
        ]);

        $post->update($validated);

        if (isset($validated['tags'])) {
            $post->tags()->sync($validated['tags']);
        }

        return response()->json($post->load(['author:id,name', 'category:id,name', 'tags:id,name']));
    }

    public function destroy(Post $post)
    {
        $post->delete();
        return response()->noContent();
    }
}
