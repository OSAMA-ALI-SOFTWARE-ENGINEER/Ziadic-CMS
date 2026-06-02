<?php

namespace App\Http\Controllers\Admin;

use App\Models\Page;
use Illuminate\Http\Request;

class PageController
{
    public function index(Request $request)
    {
        $query = Page::orderByDesc('created_at');

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
            'slug' => 'required|string|unique:pages',
            'template' => 'nullable|string',
            'content' => 'nullable',
            'status' => 'in:draft,published|default:draft',
            'seo_title' => 'nullable|string',
            'seo_description' => 'nullable|string',
            'seo_keywords' => 'nullable|string',
        ]);

        $validated['content'] = is_array($validated['content'] ?? null) ? $validated['content'] : [$validated['content']];

        $page = Page::create($validated);

        return response()->json($page, 201);
    }

    public function show(Page $page)
    {
        return response()->json($page);
    }

    public function update(Request $request, Page $page)
    {
        $validated = $request->validate([
            'title' => 'string|max:255',
            'slug' => 'string|unique:pages,slug,' . $page->id,
            'template' => 'nullable|string',
            'content' => 'nullable',
            'status' => 'in:draft,published',
            'seo_title' => 'nullable|string',
            'seo_description' => 'nullable|string',
            'seo_keywords' => 'nullable|string',
        ]);

        if (isset($validated['content'])) {
            $validated['content'] = is_array($validated['content']) ? $validated['content'] : [$validated['content']];
        }

        $page->update($validated);

        return response()->json($page);
    }

    public function destroy(Page $page)
    {
        $page->delete();
        return response()->noContent();
    }
}
