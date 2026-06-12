<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class UploadController extends Controller
{
    public function store(Request $request)
    {
        // Minimal placeholder: validate and store uploaded file(s)
        $request->validate([
            'file' => 'required|file|max:10240',
        ]);

        $path = $request->file('file')->store('uploads', 'public');

        return response()->json(['path' => $path], 201);
    }
}
