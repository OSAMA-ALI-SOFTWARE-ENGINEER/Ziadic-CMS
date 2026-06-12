<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withProviders([
        App\Providers\AppServiceProvider::class,
    ])
    ->withRouting(
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->statefulApi();

        // Apply CORS to all routes
        $middleware->use([
            \Illuminate\Http\Middleware\HandleCors::class,
        ]);

        // Register custom middleware aliases
        $middleware->alias([
            'admin-auth' => \App\Http\Middleware\AdminAuth::class,
        ]);

        // Exclude API routes from CSRF protection (Bearer token auth doesn't need CSRF)
        $middleware->validateCsrfTokens(except: [
            'api/*',
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
