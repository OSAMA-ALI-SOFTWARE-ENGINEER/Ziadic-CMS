<?php

namespace App\Http\Controllers\Admin;

use App\Models\NewsletterSubscriber;
use Illuminate\Http\Request;

class NewsletterSubscriberController
{
    public function index(Request $request)
    {
        $query = NewsletterSubscriber::query()->orderByDesc('created_at');

        if ($request->has('search')) {
            $search = (string) $request->input('search');
            $query->where('email', 'like', "%{$search}%");
        }

        if ($request->has('status')) {
            $query->where('status', (string) $request->input('status'));
        }

        $perPage = (int) $request->input('per_page', 20);

        return response()->json(
            $query->paginate($perPage)
        );
    }

    public function destroy(NewsletterSubscriber $newsletterSubscriber)
    {
        $newsletterSubscriber->delete();

        return response()->json([
            'message' => 'Subscriber deleted successfully.',
        ]);
    }

    public function destroyPublic(NewsletterSubscriber $newsletterSubscriber)
    {
        $newsletterSubscriber->delete();

        return response()->json([
            'message' => 'Subscriber deleted successfully.',
        ]);
    }
}
