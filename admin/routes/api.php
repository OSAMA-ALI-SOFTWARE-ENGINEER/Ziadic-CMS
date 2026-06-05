<?php

use App\Models\Listing;
use App\Models\Category;
use App\Models\City;
use App\Models\Country;
use App\Models\Post;
use App\Models\Page;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\ListingController;
use App\Http\Controllers\Admin\PostController;
use App\Http\Controllers\Admin\PageController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\SettingController;
use App\Http\Controllers\Admin\AdminSettingsController;
use App\Http\Controllers\Admin\UploadController;
use App\Http\Controllers\Admin\ContactMessageController;
use App\Http\Controllers\Admin\NewsletterSubscriberController;
use App\Http\Controllers\Admin\GlobalSearchController;
use App\Http\Controllers\NewsletterSubscriptionController;

Route::prefix('api/v1')->group(function (): void {
    Route::get('health', fn() => ['status' => 'ok']);

    Route::get('public/countries', function () {
        return countriesWithPlaceCounts()
            ->orderBy('name')
            ->get()
            ->map(fn(Country $country) => countryPayload($country));
    });

    Route::get('public/cities', function (Request $request) {
        return City::query()
            ->with('country:id,name,iso2')
            ->withCount(['listings as places_count' => publishedListingsScope(...)])
            ->where('is_active', true)
            ->when($request->string('country')->isNotEmpty(), function (Builder $query) use ($request): void {
                $country = $request->string('country')->toString();
                $query->whereHas('country', fn(Builder $countryQuery) => $countryQuery
                    ->where('iso2', $country)
                    ->orWhere('id', $country)
                    ->orWhere('name', $country));
            })
            ->orderBy('name')
            ->get(['id', 'country_id', 'name', 'slug', 'state_region', 'code'])
            ->map(fn(City $city) => cityPayload($city));
    });

    Route::get('public/categories', function () {
        return Category::query()
            ->where('type', 'listing')
            ->where('is_active', true)
            ->withCount(['listings as places_count' => publishedListingsScope(...)])
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get(['id', 'name', 'slug', 'description', 'icon'])
            ->map(fn(Category $category) => [
                'id' => (int) $category->getAttribute('id'),
                'name' => (string) $category->getAttribute('name'),
                'slug' => (string) $category->getAttribute('slug'),
                'description' => $category->getAttribute('description'),
                'icon' => $category->getAttribute('icon'),
                'places_count' => (int) ($category->getAttribute('places_count') ?? 0),
            ]);
    });

    Route::get('public/catalog', function () {
        return catalogPayload();
    });

    Route::get('public/popular', function () {
        return popularPayload();
    });

    Route::get('public/listings', function (Request $request) {
        return Listing::query()
            ->with(['categories:id,name,slug', 'city.country:id,name,iso2,iso3', 'images', 'hours', 'facilities', 'contacts'])
            ->where('status', 'published')
            ->when($request->string('country')->isNotEmpty(), function (Builder $query) use ($request): void {
                $country = $request->string('country')->toString();
                $query->whereHas('city.country', fn(Builder $countryQuery) => $countryQuery
                    ->where('iso2', $country)
                    ->orWhere('id', $country)
                    ->orWhere('name', $country));
            })
            ->when($request->string('city')->isNotEmpty(), function (Builder $query) use ($request): void {
                $city = $request->string('city')->toString();
                $query->whereHas('city', fn(Builder $cityQuery) => $cityQuery
                    ->where('slug', $city)
                    ->orWhere('id', $city)
                    ->orWhere('name', $city));
            })
            ->when($request->string('category')->isNotEmpty(), function (Builder $query) use ($request): void {
                $category = $request->string('category')->toString();
                $query->whereHas('categories', fn(Builder $categoryQuery) => $categoryQuery
                    ->where('slug', $category)
                    ->orWhere('id', $category)
                    ->orWhere('name', $category));
            })
            ->latest('published_at')
            ->get()
            ->map(fn(Listing $listing) => publicListingPayload($listing))
            ->values();
    });

    Route::get('public/listings/{listing:slug}', function (Listing $listing) {
        abort_unless((string) $listing->getAttribute('status') === 'published', 404);

        $listing->load(['categories:id,name,slug', 'city.country:id,name,iso2,iso3', 'images', 'hours', 'facilities', 'contacts']);

        return publicListingPayload($listing);
    });
});

if (!function_exists('publishedListingsScope')) {
    function publishedListingsScope(Builder $query): void
    {
        $query->where('status', 'published');
    }
}

if (!function_exists('cityPayload')) {
    function cityPayload(City $city): array
    {
        return [
            'id' => (int) $city->getAttribute('id'),
            'name' => (string) $city->getAttribute('name'),
            'slug' => (string) $city->getAttribute('slug'),
            'country_id' => (int) $city->getAttribute('country_id'),
            'country' => $city->country ? [
                'id' => (int) $city->country->getAttribute('id'),
                'name' => (string) $city->country->getAttribute('name'),
                'iso2' => $city->country->getAttribute('iso2'),
            ] : null,
            'places_count' => (int) ($city->getAttribute('places_count') ?? 0),
        ];
    }
}

if (!function_exists('countryPayload')) {
    function countryPayload(Country $country): array
    {
        return [
            'id' => (int) $country->getAttribute('id'),
            'name' => (string) $country->getAttribute('name'),
            'slug' => Str::slug((string) $country->getAttribute('name')),
            'iso2' => $country->getAttribute('iso2'),
            'iso3' => $country->getAttribute('iso3'),
            'places_count' => (int) ($country->getAttribute('places_count') ?? 0),
        ];
    }
}

if (!function_exists('countriesWithPlaceCounts')) {
    function countriesWithPlaceCounts(): Builder
    {
        return Country::query()
            ->where('is_active', true)
            ->select(['id', 'name', 'iso2', 'iso3'])
            ->selectSub(
                Listing::query()
                    ->join('cities', 'listings.city_id', '=', 'cities.id')
                    ->selectRaw('count(*)')
                    ->whereColumn('cities.country_id', 'countries.id')
                    ->where('listings.status', 'published'),
                'places_count',
            );
    }
}

if (!function_exists('publicListingPayload')) {
    function publicListingPayload(Listing $listing): array
{
    $featuredImage = $listing->images->firstWhere('is_featured', true) ?? $listing->images->sortBy('sort_order')->first();
    $gallery = $listing->images
        ->sortBy('sort_order')
        ->map(fn($image) => $image->path)
        ->filter()
        ->values();
    $contacts = $listing->contacts
        ->sortBy('sort_order')
        ->mapWithKeys(fn($contact) => [$contact->type => $contact->value]);
    $hours = $listing->hours
        ->sortBy('day_of_week')
        ->filter(fn($hour) => ! $hour->is_closed && $hour->opens_at && $hour->closes_at)
        ->first();
    $category = $listing->categories->first();
    $cityName = $listing->city?->name ?: $listing->city?->state_region;

    return [
        'id' => (int) $listing->getAttribute('id'),
        'slug' => (string) $listing->getAttribute('slug'),
        'title' => (string) $listing->getAttribute('title'),
        'business_name' => $listing->getAttribute('business_name'),
        'category' => $category?->name ?? 'Featured Listing',
        'country' => $listing->city?->country ? [
            'id' => (int) $listing->city->country->getAttribute('id'),
            'name' => (string) $listing->city->country->getAttribute('name'),
            'iso2' => $listing->city->country->getAttribute('iso2'),
        ] : null,
        'categories' => $listing->categories->map(fn($category) => [
            'name' => (string) $category->getAttribute('name'),
            'slug' => (string) $category->getAttribute('slug'),
        ])->values(),
        'image' => $featuredImage?->path ?: $listing->getAttribute('og_image'),
        'gallery' => $gallery,
        'location' => $listing->getAttribute('address') ?: $cityName ?: 'Location available soon',
        'city' => $cityName,
        'city_slug' => $listing->city?->getAttribute('slug'),
        'days' => $hours ? 'Open weekly' : 'Monday - Saturday',
        'hours' => $hours ? Str::of((string) $hours->opens_at)->substr(0, 5) . ' - ' . Str::of((string) $hours->closes_at)->substr(0, 5) : '06:00 AM - 10:00 PM',
        'summary' => $listing->getAttribute('excerpt') ?: Str::limit(strip_tags((string) $listing->getAttribute('description')), 180),
        'description' => $listing->getAttribute('description'),
        'contact_address' => $contacts->get('address', $listing->getAttribute('address')),
        'phone' => $listing->getAttribute('phone') ?: $contacts->get('phone'),
        'email' => $listing->getAttribute('email') ?: $contacts->get('email'),
        'website_url' => $listing->getAttribute('website_url') ?: $contacts->get('website'),
        'details_title' => $listing->getAttribute('business_name') ? $listing->getAttribute('business_name') . ' Details' : $listing->getAttribute('title') . ' Details',
        'details_paragraphs' => array_values(array_filter([
            $listing->getAttribute('description'),
            $listing->getAttribute('excerpt'),
        ])),
        'facilities' => $listing->facilities->sortBy('sort_order')->pluck('name')->values(),
        'seo' => [
            'title' => $listing->getAttribute('seo_title'),
            'description' => $listing->getAttribute('seo_description'),
            'keywords' => $listing->getAttribute('seo_keywords'),
        ],
        'is_featured' => (bool) $listing->getAttribute('is_featured'),
        'published_at' => $listing->getAttribute('published_at'),
    ];
    }
}

if (!function_exists('catalogPayload')) {
    function catalogPayload(): array
    {
    $countries = countriesWithPlaceCounts()
        ->orderBy('name')
        ->get()
        ->map(fn(Country $country) => countryPayload($country));

    $cities = City::query()
        ->with('country:id,name,iso2')
        ->withCount(['listings as places_count' => publishedListingsScope(...)])
        ->where('is_active', true)
        ->orderBy('name')
        ->get(['id', 'country_id', 'name', 'slug', 'state_region', 'code'])
        ->map(fn(City $city) => cityPayload($city));

    $categories = Category::query()
        ->where('type', 'listing')
        ->where('is_active', true)
        ->withCount(['listings as places_count' => publishedListingsScope(...)])
        ->orderBy('sort_order')
        ->orderBy('name')
        ->get(['id', 'name', 'slug', 'description', 'icon'])
        ->map(fn(Category $category) => [
            'id' => (int) $category->getAttribute('id'),
            'name' => (string) $category->getAttribute('name'),
            'slug' => (string) $category->getAttribute('slug'),
            'description' => $category->getAttribute('description'),
            'icon' => $category->getAttribute('icon'),
            'places_count' => (int) ($category->getAttribute('places_count') ?? 0),
        ]);

    return [
        'countries' => $countries,
        'cities' => $cities,
        'categories' => $categories,
        'popular' => popularPayload(),
    ];
    }
}

if (!function_exists('popularPayload')) {
    function popularPayload(): array
    {
        $countries = countriesWithPlaceCounts()
            ->orderByDesc('places_count')
            ->limit(6)
            ->get()
            ->map(fn(Country $country) => [
                'type' => 'country',
                'label' => (string) $country->getAttribute('name'),
                'value' => $country->getAttribute('iso2'),
                'places_count' => (int) ($country->getAttribute('places_count') ?? 0),
            ]);

        $cities = City::query()
            ->with('country:id,name,iso2')
            ->where('is_active', true)
            ->withCount(['listings as places_count' => publishedListingsScope(...)])
            ->orderByDesc('places_count')
            ->limit(6)
            ->get(['id', 'country_id', 'name', 'slug'])
            ->map(fn(City $city) => [
                'type' => 'city',
                'label' => (string) $city->getAttribute('name'),
                'value' => (string) $city->getAttribute('slug'),
                'country' => $city->country?->getAttribute('iso2'),
                'places_count' => (int) ($city->getAttribute('places_count') ?? 0),
            ]);

        $categories = Category::query()
            ->where('type', 'listing')
            ->where('is_active', true)
            ->withCount(['listings as places_count' => publishedListingsScope(...)])
            ->orderByDesc('places_count')
            ->limit(6)
            ->get(['id', 'name', 'slug'])
            ->map(fn(Category $category) => [
                'type' => 'category',
                'label' => (string) $category->getAttribute('name'),
                'value' => (string) $category->getAttribute('slug'),
                'places_count' => (int) ($category->getAttribute('places_count') ?? 0),
            ]);

        return [
            'countries' => $countries,
            'cities' => $cities,
            'categories' => $categories,
        ];
    }
}

// Auth routes (public)
Route::prefix('api/v1/auth')->group(function (): void {
    Route::post('login', [AuthController::class, 'login']);
    Route::post('register', [AuthController::class, 'register']);
    Route::middleware('auth:sanctum')->group(function (): void {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('me', [AuthController::class, 'me']);
    });
});

// Public blog/pages
Route::prefix('api/v1/public')->group(function (): void {
    Route::get('search', [GlobalSearchController::class, 'index']);
    Route::post('newsletter/subscribe', [NewsletterSubscriptionController::class, 'store']);
    Route::get('newsletter/subscribers', [NewsletterSubscriberController::class, 'index']);
    Route::delete('newsletter/subscribers/{newsletterSubscriber}', [NewsletterSubscriberController::class, 'destroyPublic']);

    Route::get('posts', function () {
        return Post::query()
            ->where('status', 'published')
            ->with('author:id,name', 'category:id,name', 'tags:id,name')
            ->latest('published_at')
            ->get(['id', 'title', 'slug', 'excerpt', 'author_id', 'category_id', 'published_at']);
    });

    Route::get('posts/{post:slug}', function (Post $post) {
        abort_unless((string) $post->getAttribute('status') === 'published', 404);
        return $post->load('author:id,name', 'category:id,name', 'tags:id,name');
    });

    Route::get('pages/{page:slug}', function (Page $page) {
        abort_unless((string) $page->getAttribute('status') === 'published', 404);
        return $page;
    });
});

// Admin routes (protected)
Route::prefix('api/v1/admin')->middleware('auth:sanctum')->group(function (): void {
    Route::get('search', [GlobalSearchController::class, 'index']);
    Route::get('dashboard', [DashboardController::class, 'index']);

    // File upload
    Route::post('upload', [UploadController::class, 'store']);

    // Settings endpoints (branding, theme, seo, payments)
    Route::get('settings/{section}', [AdminSettingsController::class, 'show']);
    Route::post('settings/{section}', [AdminSettingsController::class, 'update']);

    Route::apiResource('listings', ListingController::class);
    Route::patch('listings/{listing}/approve', [ListingController::class, 'approve']);
    Route::patch('listings/{listing}/reject', [ListingController::class, 'reject']);
    Route::patch('listings/{listing}/publish', [ListingController::class, 'publish']);

    Route::apiResource('posts', PostController::class);
    Route::apiResource('pages', PageController::class);
    Route::apiResource('categories', CategoryController::class);

    Route::get('users', [UserController::class, 'index']);
    Route::get('users/{user}', [UserController::class, 'show']);
    Route::patch('users/{user}/role', [UserController::class, 'assignRole']);

    Route::get('settings', [SettingController::class, 'index']);
    Route::post('settings', [SettingController::class, 'upsert']);

    Route::get('contact-messages', [ContactMessageController::class, 'index']);
    Route::patch('contact-messages/{message}', [ContactMessageController::class, 'updateStatus']);

    Route::get('newsletter-subscribers', [NewsletterSubscriberController::class, 'index']);
    Route::delete('newsletter-subscribers/{newsletterSubscriber}', [NewsletterSubscriberController::class, 'destroy']);
});
