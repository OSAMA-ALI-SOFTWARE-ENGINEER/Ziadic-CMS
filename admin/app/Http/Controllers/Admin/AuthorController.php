<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Author;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AuthorController extends Controller
{
    public function index()
    {
        return response()->json([
            'data' => Author::withCount('articles')->paginate(20),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:authors,email',
            'bio' => 'nullable|string',
            'avatar' => 'nullable|string',
        ]);

        $author = Author::create([
            ...$validated,
            'slug' => Str::slug($validated['name']),
        ]);

        return response()->json([
            'message' => 'Author created successfully',
            'data' => $author,
        ], 201);
    }

    public function show(Author $author)
    {
        return response()->json([
            'data' => $author->load('articles'),
        ]);
    }

    public function update(Request $request, Author $author)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:authors,email,' . $author->id,
            'bio' => 'nullable|string',
            'avatar' => 'nullable|string',
        ]);

        $author->update($validated);

        return response()->json([
            'message' => 'Author updated successfully',
            'data' => $author,
        ]);
    }

    public function destroy(Author $author)
    {
        $author->delete();
        return response()->json(['message' => 'Author deleted successfully']);
    }
}
