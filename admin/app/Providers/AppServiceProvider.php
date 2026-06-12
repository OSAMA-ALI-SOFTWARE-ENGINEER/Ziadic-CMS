<?php

namespace App\Providers;

use App\Models\User;
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
            return $user->hasRole('super-admin') ? true : null;
        });

        // Define specific gates
        Gate::define('viewActivityLogs', function (User $user): bool {
            // allow super-admin via before; otherwise check explicit role
            return $user->hasRole('super-admin') || $user->getAttribute('role') === 'super_admin';
        });

        $this->registerRoutes();

        // Register model observers
        \App\Models\Listing::observe(\App\Observers\ListingObserver::class);
        if (class_exists(\App\Models\ListingSubmission::class)) {
            \App\Models\ListingSubmission::observe(\App\Observers\ListingSubmissionObserver::class);
        }
    }

    protected function registerRoutes(): void
    {
        $this->loadRoutesFrom(base_path('routes/api.php'));
    }
}
