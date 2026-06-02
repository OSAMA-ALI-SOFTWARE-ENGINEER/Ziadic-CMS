<?php

namespace App\Http\Controllers\Admin;

use App\Models\Listing;
use App\Models\Post;
use App\Models\User;
use App\Models\ContactMessage;

class DashboardController
{
    public function index()
    {
        return response()->json([
            'total_listings' => Listing::count(),
            'published_listings' => Listing::where('status', 'published')->count(),
            'pending_approvals' => Listing::where('status', 'pending')->count(),
            'total_users' => User::count(),
            'total_posts' => Post::count(),
            'unread_messages' => ContactMessage::where('status', 'new')->count(),
            'recent_listings' => Listing::latest()->with('city:id,name')->take(10)->get([
                'id', 'title', 'business_name', 'city_id', 'status', 'is_featured', 'created_at'
            ]),
        ]);
    }
}
