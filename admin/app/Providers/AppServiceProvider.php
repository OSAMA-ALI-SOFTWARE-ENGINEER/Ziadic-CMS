<?php

namespace App\Providers;

use App\Events\MediaDeleted;
use App\Events\MediaUploaded;
use App\Events\MediaUpdated;
use App\Listeners\LogMediaDeleted;
use App\Listeners\LogMediaUpdated;
use App\Listeners\LogMediaUploaded;
use App\Models\User;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Gate::before(function (User $user): ?bool {
            // Allow super-admin and preview users (used in development)
            if ($user->hasRole('super-admin')) {
                return true;
            }

            // Check if this is a preview user (from preview token in development)
            if ($user->email === 'admin@test.local') {
                return true;
            }

            return null;
        });

        // Define specific gates
        Gate::define('viewActivityLogs', function (User $user): bool {
            // allow super-admin via before; otherwise check explicit role
            return $user->hasRole('super-admin') || $user->getAttribute('role') === 'super_admin';
        });

        $this->registerRoutes();
        $this->registerEventListeners();

        // Register model observers
        \App\Models\Listing::observe(\App\Observers\ListingObserver::class);
        if (class_exists(\App\Models\ListingSubmission::class)) {
            \App\Models\ListingSubmission::observe(\App\Observers\ListingSubmissionObserver::class);
        }
    }

    protected function registerEventListeners(): void
    {
        Event::listen(MediaUploaded::class, LogMediaUploaded::class);
        Event::listen(MediaUpdated::class, LogMediaUpdated::class);
        Event::listen(MediaDeleted::class, LogMediaDeleted::class);
    }

    protected function registerRoutes(): void
    {
        $this->loadRoutesFrom(base_path('routes/api.php'));
    }
}
