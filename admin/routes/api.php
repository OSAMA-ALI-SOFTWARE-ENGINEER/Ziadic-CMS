<?php

use App\Models\Listing;
use App\Models\Category;
use App\Models\City;
use App\Models\Country;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;

Route::prefix('v1')->group(function (): void {
    Route::get('health', fn () => ['status' => 'ok']);

    Route::get('public/countries', function () {
        return Country::query()
            ->where('is_active', true)
            ->withCount(['cities as places_count' => fn (Builder $query) => $query->whereHas('listings', publishedListingsScope(...))])
            ->orderBy('name')
            ->get(['id', 'name', 'iso2', 'iso3'])
            ->map(fn (Country $country) => [
                'id' => $country->id,
                'name' => $country->name,
                'slug' => Str::slug($country->name),
                'iso2' => $country->iso2,
                'iso3' => $country->iso3,
                'places_count' => $country->places_count,
            ]);
    });

    Route::get('public/cities', function (Request $request) {
        return City::query()
            ->with('country:id,name,iso2')
            ->withCount(['listings as places_count' => publishedListingsScope(...)])
            ->where('is_active', true)
            ->when($request->string('country')->isNotEmpty(), function (Builder $query) use ($request): void {
                $country = $request->string('country')->toString();
                $query->whereHas('country', fn (Builder $countryQuery) => $countryQuery
                    ->where('iso2', $country)
                    ->orWhere('id', $country)
                    ->orWhere('name', $country));
            })
            ->orderBy('name')
            ->get(['id', 'country_id', 'name', 'slug', 'state_region', 'code'])
            ->map(fn (City $city) => cityPayload($city));
    });

    Route::get('public/categories', function () {
        return Category::query()
            ->where('type', 'listing')
            ->where('is_active', true)
            ->withCount(['listings as places_count' => publishedListingsScope(...)])
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get(['id', 'name', 'slug', 'description', 'icon'])
            ->map(fn (Category $category) => [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
                'description' => $category->description,
                'icon' => $category->icon,
                'places_count' => $category->places_count,
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
                $query->whereHas('city.country', fn (Builder $countryQuery) => $countryQuery
                    ->where('iso2', $country)
                    ->orWhere('id', $country)
                    ->orWhere('name', $country));
            })
            ->when($request->string('city')->isNotEmpty(), function (Builder $query) use ($request): void {
                $city = $request->string('city')->toString();
                $query->whereHas('city', fn (Builder $cityQuery) => $cityQuery
                    ->where('slug', $city)
                    ->orWhere('id', $city)
                    ->orWhere('name', $city));
            })
            ->when($request->string('category')->isNotEmpty(), function (Builder $query) use ($request): void {
                $category = $request->string('category')->toString();
                $query->whereHas('categories', fn (Builder $categoryQuery) => $categoryQuery
                    ->where('slug', $category)
                    ->orWhere('id', $category)
                    ->orWhere('name', $category));
            })
            ->latest('published_at')
            ->get()
            ->map(fn (Listing $listing) => publicListingPayload($listing))
            ->values();
    });

    Route::get('public/listings/{listing:slug}', function (Listing $listing) {
        abort_unless($listing->status === 'published', 404);

        $listing->load(['categories:id,name,slug', 'city.country:id,name,iso2,iso3', 'images', 'hours', 'facilities', 'contacts']);

        return publicListingPayload($listing);
    });
});

function publishedListingsScope(Builder $query): void
{
    $query->where('status', 'published');
}

function cityPayload(City $city): array
{
    return [
        'id' => $city->id,
        'name' => $city->name,
        'slug' => $city->slug,
        'country_id' => $city->country_id,
        'country' => $city->country ? [
            'id' => $city->country->id,
            'name' => $city->country->name,
            'iso2' => $city->country->iso2,
        ] : null,
        'places_count' => $city->places_count ?? 0,
    ];
}

function publicListingPayload(Listing $listing): array
{
    $featuredImage = $listing->images->firstWhere('is_featured', true) ?? $listing->images->sortBy('sort_order')->first();
    $gallery = $listing->images
        ->sortBy('sort_order')
        ->map(fn ($image) => $image->path)
        ->filter()
        ->values();
    $contacts = $listing->contacts
        ->sortBy('sort_order')
        ->mapWithKeys(fn ($contact) => [$contact->type => $contact->value]);
    $hours = $listing->hours
        ->sortBy('day_of_week')
        ->filter(fn ($hour) => ! $hour->is_closed && $hour->opens_at && $hour->closes_at)
        ->first();
    $category = $listing->categories->first();
    $cityName = $listing->city?->name ?: $listing->city?->state_region;

    return [
        'id' => $listing->id,
        'slug' => $listing->slug,
        'title' => $listing->title,
        'business_name' => $listing->business_name,
        'category' => $category?->name ?? 'Featured Listing',
        'country' => $listing->city?->country ? [
            'id' => $listing->city->country->id,
            'name' => $listing->city->country->name,
            'iso2' => $listing->city->country->iso2,
        ] : null,
        'categories' => $listing->categories->map(fn ($category) => [
            'name' => $category->name,
            'slug' => $category->slug,
        ])->values(),
        'image' => $featuredImage?->path ?: $listing->og_image,
        'gallery' => $gallery,
        'location' => $listing->address ?: $cityName ?: 'Location available soon',
        'city' => $cityName,
        'city_slug' => $listing->city?->slug,
        'days' => $hours ? 'Open weekly' : 'Monday - Saturday',
        'hours' => $hours ? Str::of((string) $hours->opens_at)->substr(0, 5).' - '.Str::of((string) $hours->closes_at)->substr(0, 5) : '06:00 AM - 10:00 PM',
        'summary' => $listing->excerpt ?: Str::limit(strip_tags((string) $listing->description), 180),
        'description' => $listing->description,
        'contact_address' => $contacts->get('address', $listing->address),
        'phone' => $listing->phone ?: $contacts->get('phone'),
        'email' => $listing->email ?: $contacts->get('email'),
        'website_url' => $listing->website_url ?: $contacts->get('website'),
        'details_title' => $listing->business_name ? $listing->business_name.' Details' : $listing->title.' Details',
        'details_paragraphs' => array_values(array_filter([
            $listing->description,
            $listing->excerpt,
        ])),
        'facilities' => $listing->facilities->sortBy('sort_order')->pluck('name')->values(),
        'seo' => [
            'title' => $listing->seo_title,
            'description' => $listing->seo_description,
            'keywords' => $listing->seo_keywords,
        ],
        'is_featured' => $listing->is_featured,
        'published_at' => $listing->published_at,
    ];
}

function catalogPayload(): array
{
    $countries = Country::query()
        ->where('is_active', true)
        ->withCount(['cities as places_count' => fn (Builder $query) => $query->whereHas('listings', publishedListingsScope(...))])
        ->orderBy('name')
        ->get(['id', 'name', 'iso2', 'iso3'])
        ->map(fn (Country $country) => [
            'id' => $country->id,
            'name' => $country->name,
            'slug' => Str::slug($country->name),
            'iso2' => $country->iso2,
            'iso3' => $country->iso3,
            'places_count' => $country->places_count,
        ]);

    $cities = City::query()
        ->with('country:id,name,iso2')
        ->withCount(['listings as places_count' => publishedListingsScope(...)])
        ->where('is_active', true)
        ->orderBy('name')
        ->get(['id', 'country_id', 'name', 'slug', 'state_region', 'code'])
        ->map(fn (City $city) => cityPayload($city));

    $categories = Category::query()
        ->where('type', 'listing')
        ->where('is_active', true)
        ->withCount(['listings as places_count' => publishedListingsScope(...)])
        ->orderBy('sort_order')
        ->orderBy('name')
        ->get(['id', 'name', 'slug', 'description', 'icon'])
        ->map(fn (Category $category) => [
            'id' => $category->id,
            'name' => $category->name,
            'slug' => $category->slug,
            'description' => $category->description,
            'icon' => $category->icon,
            'places_count' => $category->places_count,
        ]);

    return [
        'countries' => $countries,
        'cities' => $cities,
        'categories' => $categories,
        'popular' => popularPayload(),
    ];
}

function popularPayload(): array
{
    $countries = Country::query()
        ->where('is_active', true)
        ->withCount(['cities as places_count' => fn (Builder $query) => $query->whereHas('listings', publishedListingsScope(...))])
        ->orderByDesc('places_count')
        ->limit(6)
        ->get(['id', 'name', 'iso2', 'iso3'])
        ->map(fn (Country $country) => [
            'type' => 'country',
            'label' => $country->name,
            'value' => $country->iso2,
            'places_count' => $country->places_count,
        ]);

    $cities = City::query()
        ->with('country:id,name,iso2')
        ->where('is_active', true)
        ->withCount(['listings as places_count' => publishedListingsScope(...)])
        ->orderByDesc('places_count')
        ->limit(6)
        ->get(['id', 'country_id', 'name', 'slug'])
        ->map(fn (City $city) => [
            'type' => 'city',
            'label' => $city->name,
            'value' => $city->slug,
            'country' => $city->country?->iso2,
            'places_count' => $city->places_count,
        ]);

    $categories = Category::query()
        ->where('type', 'listing')
        ->where('is_active', true)
        ->withCount(['listings as places_count' => publishedListingsScope(...)])
        ->orderByDesc('places_count')
        ->limit(6)
        ->get(['id', 'name', 'slug'])
        ->map(fn (Category $category) => [
            'type' => 'category',
            'label' => $category->name,
            'value' => $category->slug,
            'places_count' => $category->places_count,
        ]);

    return [
        'countries' => $countries,
        'cities' => $cities,
        'categories' => $categories,
    ];
}
