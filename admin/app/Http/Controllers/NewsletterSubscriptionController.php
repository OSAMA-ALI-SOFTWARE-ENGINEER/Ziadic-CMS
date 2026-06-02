<?php

namespace App\Http\Controllers;

use App\Mail\NewsletterSubscriptionConfirmationMail;
use App\Models\NewsletterSubscriber;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class NewsletterSubscriptionController
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email|max:255',
            'source' => 'nullable|string|max:64',
        ]);

        $normalizedEmail = strtolower(trim((string) $validated['email']));

        $subscriber = NewsletterSubscriber::query()->firstOrCreate(
            ['email' => $normalizedEmail],
            [
                'status' => 'active',
                'source' => $validated['source'] ?? 'footer',
                'subscribed_at' => now(),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ],
        );

        if ($subscriber->wasRecentlyCreated) {
            try {
                Mail::to($subscriber->email)->send(new NewsletterSubscriptionConfirmationMail($subscriber->email));
                $subscriber->update(['confirmation_sent_at' => now()]);
            } catch (\Throwable) {
                // Avoid failing subscription capture when mail transport is unavailable.
            }

            return response()->json([
                'message' => 'Subscribed successfully. Please check your email for confirmation.',
            ], 201);
        }

        return response()->json([
            'message' => 'This email is already subscribed.',
        ]);
    }
}
