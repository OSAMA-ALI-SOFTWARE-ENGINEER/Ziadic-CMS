<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Article;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class ArticleController extends Controller
{
    public function index(Request $request)
    {
        $query = Article::with(['author', 'category', 'tags', 'creator', 'updater', 'approver']);

        if ($request->filled('status')) {
            $query->where('status', $request->get('status'));
        }

        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('slug', 'like', "%{$search}%");
            });
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->get('category_id'));
        }

        if ($request->filled('author_id')) {
            $query->where('author_id', $request->get('author_id'));
        }

        return response()->json([
            'data' => $query->latest('created_at')->paginate(20),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'excerpt' => 'nullable|string|max:500',
            'content' => 'required|string',
            'featured_image' => 'nullable|file|image|max:5120',
            'author_id' => 'required|integer|exists:authors,id',
            'category_id' => 'nullable|integer|exists:article_categories,id',
            'seo_title' => 'nullable|string|max:255',
            'seo_description' => 'nullable|string|max:500',
            'seo_keywords' => 'nullable|string',
            'og_image' => 'nullable|string',
            'tags' => 'nullable|array',
        ]);

        $featuredImage = null;
        if ($request->hasFile('featured_image')) {
            $file = $request->file('featured_image');
            $path = $file->store('articles', 'public');
            $featuredImage = '/storage/' . $path;
        }

        $article = Article::create([
            'title' => $validated['title'],
            'excerpt' => $validated['excerpt'],
            'content' => $validated['content'],
            'featured_image' => $featuredImage,
            'author_id' => $validated['author_id'],
            'category_id' => $validated['category_id'],
            'seo_title' => $validated['seo_title'],
            'seo_description' => $validated['seo_description'],
            'seo_keywords' => $validated['seo_keywords'],
            'og_image' => $validated['og_image'],
            'slug' => Str::slug($validated['title']),
            'created_by' => auth()->id(),
        ]);

        if ($request->filled('tags')) {
            $article->tags()->sync($request->get('tags'));
        }

        return response()->json([
            'message' => 'Article created successfully',
            'data' => $article->load(['author', 'category', 'tags']),
        ], 201);
    }

    public function show(Article $article)
    {
        $article->load(['author', 'category', 'tags', 'creator', 'updater']);

        return response()->json([
            'data' => [
                'id' => $article->id,
                'title' => $article->title,
                'slug' => $article->slug,
                'excerpt' => $article->excerpt,
                'content' => $article->content,
                'featured_image' => $article->featured_image,
                'author_id' => $article->author_id,
                'category_id' => $article->category_id,
                'status' => $article->status,
                'seo_title' => $article->seo_title,
                'seo_description' => $article->seo_description,
                'seo_keywords' => $article->seo_keywords,
                'og_image' => $article->og_image,
                'published_at' => $article->published_at,
                'author' => $article->author,
                'category' => $article->category,
                'tags' => $article->tags,
            ],
        ]);
    }

    public function update(Request $request, Article $article)
    {
        // Only validate featured_image if it's actually being sent
        $rules = [
            'title' => 'required|string|max:255',
            'excerpt' => 'nullable|string|max:500',
            'content' => 'required|string',
            'author_id' => 'required|integer|exists:authors,id',
            'category_id' => 'nullable|integer|exists:article_categories,id',
            'seo_title' => 'nullable|string|max:255',
            'seo_description' => 'nullable|string|max:500',
            'seo_keywords' => 'nullable|string',
            'og_image' => 'nullable|string',
            'tags' => 'nullable|array',
        ];

        if ($request->hasFile('featured_image')) {
            $rules['featured_image'] = 'file|image|max:5120';
        }

        try {
            $validated = $request->validate($rules);
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Article update validation error', [
                'article_id' => $article->id,
                'errors' => $e->errors(),
                'input' => $request->except('content'),
            ]);
            throw $e;
        }

        $updateData = [
            'title' => $validated['title'],
            'excerpt' => $validated['excerpt'],
            'content' => $validated['content'],
            'author_id' => $validated['author_id'],
            'category_id' => $validated['category_id'],
            'seo_title' => $validated['seo_title'],
            'seo_description' => $validated['seo_description'],
            'seo_keywords' => $validated['seo_keywords'],
            'og_image' => $validated['og_image'],
            'updated_by' => auth()->id(),
        ];

        if ($request->hasFile('featured_image')) {
            $file = $request->file('featured_image');
            $path = $file->store('articles', 'public');
            $updateData['featured_image'] = '/storage/' . $path;
        }

        $article->update($updateData);

        if ($request->filled('tags')) {
            $article->tags()->sync($request->get('tags'));
        }

        return response()->json([
            'message' => 'Article updated successfully',
            'data' => $article->load(['author', 'category', 'tags']),
        ]);
    }

    public function destroy(Article $article)
    {
        $article->delete();
        return response()->json(['message' => 'Article deleted successfully']);
    }

    public function submit(Article $article)
    {
        if ($article->status !== 'draft') {
            return response()->json(['message' => 'Only draft articles can be submitted'], 400);
        }

        $article->update(['status' => 'pending_review']);

        return response()->json([
            'message' => 'Article submitted for review',
            'data' => $article,
        ]);
    }

    public function approve(Article $article)
    {
        if ($article->status !== 'pending_review') {
            return response()->json(['message' => 'Only pending articles can be approved'], 400);
        }

        $article->update([
            'status' => 'approved',
            'approved_by' => auth()->id(),
        ]);

        return response()->json([
            'message' => 'Article approved',
            'data' => $article,
        ]);
    }

    public function reject(Request $request, Article $article)
    {
        if ($article->status !== 'pending_review') {
            return response()->json(['message' => 'Only pending articles can be rejected'], 400);
        }

        $reason = $request->string('reason')->toString();

        $article->update([
            'status' => 'rejected',
            'rejection_reason' => $reason,
        ]);

        return response()->json([
            'message' => 'Article rejected',
            'data' => $article,
        ]);
    }

    public function publish(Article $article)
    {
        if ($article->status !== 'approved') {
            return response()->json(['message' => 'Only approved articles can be published'], 400);
        }

        $article->update([
            'status' => 'published',
            'published_at' => now(),
        ]);

        return response()->json([
            'message' => 'Article published successfully',
            'data' => $article,
        ]);
    }
}
