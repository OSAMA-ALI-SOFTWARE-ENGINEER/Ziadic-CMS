<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CachePublicApi
{
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);

        // Cache GET requests for public API endpoints for 1 hour
        if ($request->isMethod('get') && $request->path() === 'api/v1/public/listings') {
            $response->header('Cache-Control', 'public, max-age=3600, s-maxage=3600');
            $response->header('Pragma', 'public');
            $response->header('Expires', now()->addHour()->toRfc7231String());
        }

        // Cache popular listings for 30 minutes
        if ($request->isMethod('get') && strpos($request->path(), 'api/v1/public/listings/popular') !== false) {
            $response->header('Cache-Control', 'public, max-age=1800, s-maxage=1800');
            $response->header('Pragma', 'public');
            $response->header('Expires', now()->addMinutes(30)->toRfc7231String());
        }

        // Cache individual listing for 6 hours
        if ($request->isMethod('get') && strpos($request->path(), 'api/v1/public/listings/') !== false) {
            $response->header('Cache-Control', 'public, max-age=21600, s-maxage=21600');
            $response->header('Pragma', 'public');
            $response->header('Expires', now()->addHours(6)->toRfc7231String());
        }

        return $response;
    }
}
