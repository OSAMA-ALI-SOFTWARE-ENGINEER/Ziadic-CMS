<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\City;
use App\Models\Country;
use App\Models\Listing;
use App\Models\Page;
use App\Models\Plan;
use App\Models\Post;
use App\Models\Service;
use App\Models\Setting;
use App\Models\Tag;
use App\Models\TeamMember;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedRolesAndPermissions();

        $admin = User::query()->firstOrCreate(
            ['email' => env('ADMIN_EMAIL', 'admin@kukaqka.com')],
            [
                'name' => env('ADMIN_NAME', 'Super Admin'),
                'password' => Hash::make(env('ADMIN_PASSWORD', 'password')),
                'status' => 'active',
                'email_verified_at' => now(),
            ],
        );

        $admin->assignRole('super-admin');

        $countries = $this->seedLocations();
        $categories = $this->seedCategories();
        $tags = $this->seedTags();

        $this->seedSettings();
        $this->seedPlans();
        $this->seedPages();
        $this->seedServices();
        $this->seedTeam();
        $this->seedListings($admin, $countries, $categories, $tags);
        $this->seedPosts($admin, $categories, $tags);
    }

    private function seedRolesAndPermissions(): void
    {
        $permissions = [
            'users.view', 'users.create', 'users.update', 'users.delete',
            'roles.view', 'roles.create', 'roles.update', 'roles.delete',
            'listings.view', 'listings.create', 'listings.update', 'listings.delete', 'listings.approve', 'listings.publish',
            'categories.manage', 'posts.manage', 'pages.manage', 'services.manage',
            'media.manage', 'settings.manage', 'payments.view', 'payments.refund',
        ];

        foreach ($permissions as $permission) {
            Permission::query()->firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        $superAdmin = Role::query()->firstOrCreate(['name' => 'super-admin', 'guard_name' => 'web']);
        $admin = Role::query()->firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        Role::query()->firstOrCreate(['name' => 'staff', 'guard_name' => 'web']);
        Role::query()->firstOrCreate(['name' => 'client', 'guard_name' => 'web']);

        $superAdmin->syncPermissions(Permission::all());
        $admin->syncPermissions(Permission::query()->whereNotIn('name', ['roles.delete'])->get());
    }

    private function seedLocations(): array
    {
        $countries = [];

        foreach ([
            ['name' => 'Albania', 'iso2' => 'AL', 'iso3' => 'ALB'],
            ['name' => 'Kosovo', 'iso2' => 'XK', 'iso3' => 'XKX'],
            ['name' => 'North Macedonia', 'iso2' => 'MK', 'iso3' => 'MKD'],
            ['name' => 'Germany', 'iso2' => 'DE', 'iso3' => 'DEU'],
            ['name' => 'Austria', 'iso2' => 'AT', 'iso3' => 'AUT'],
            ['name' => 'Switzerland', 'iso2' => 'CH', 'iso3' => 'CHE'],
        ] as $countryData) {
            $countries[$countryData['iso2']] = Country::query()->firstOrCreate(
                ['iso2' => $countryData['iso2']],
                $countryData,
            );
        }

        foreach ([
            ['country' => 'AL', 'name' => 'Vlore, AL', 'slug' => 'vlore-al'],
            ['country' => 'AL', 'name' => 'Tirana, AL', 'slug' => 'tirana-al'],
            ['country' => 'AL', 'name' => 'Lushnje, AL', 'slug' => 'lushnje-al'],
            ['country' => 'AL', 'name' => 'Shkoder, AL', 'slug' => 'shkoder-al'],
            ['country' => 'XK', 'name' => 'Prizren, KS', 'slug' => 'prizren-ks'],
            ['country' => 'XK', 'name' => 'Ferizaj, KS', 'slug' => 'ferizaj-ks'],
            ['country' => 'MK', 'name' => 'Skopje, MK', 'slug' => 'skopje-mk'],
            ['country' => 'DE', 'name' => 'Berlin, DE', 'slug' => 'berlin-de'],
            ['country' => 'AT', 'name' => 'Salzburg, AT', 'slug' => 'salzburg-at'],
            ['country' => 'CH', 'name' => 'Luzern, CH', 'slug' => 'luzern-ch'],
        ] as $cityData) {
            City::query()->firstOrCreate(
                ['slug' => $cityData['slug']],
                [
                    'country_id' => $countries[$cityData['country']]->id,
                    'name' => $cityData['name'],
                    'is_active' => true,
                ],
            );
        }

        return $countries;
    }

    private function seedCategories(): array
    {
        $categories = [];

        foreach ([
            'Arts and Culture',
            'Dining and Restaurants',
            'Sports and Fitness',
            'Shopping and Retail',
            'Travel and Exploration',
            'Entertainment and Nightlife',
            'Wedding and Event Location',
            'Car Rental',
        ] as $name) {
            $categories[$name] = Category::query()->firstOrCreate(
                ['type' => 'listing', 'slug' => Str::slug($name)],
                ['name' => $name, 'is_active' => true],
            );
        }

        foreach (['City Life', 'Travelling', 'Artistry'] as $name) {
            Category::query()->firstOrCreate(
                ['type' => 'blog', 'slug' => Str::slug($name)],
                ['name' => $name, 'is_active' => true],
            );
        }

        return $categories;
    }

    private function seedTags(): array
    {
        $tags = [];

        foreach (['featured', 'popular', 'new', 'family-friendly', 'premium'] as $name) {
            $tags[$name] = Tag::query()->firstOrCreate(['slug' => $name], ['name' => Str::headline($name)]);
        }

        return $tags;
    }

    private function seedSettings(): void
    {
        foreach ([
            ['group' => 'site', 'key' => 'name', 'value' => 'Kukaqka', 'type' => 'string', 'is_public' => true],
            ['group' => 'site', 'key' => 'url', 'value' => 'http://kukaqka.com', 'type' => 'string', 'is_public' => true],
            ['group' => 'seo', 'key' => 'default_title', 'value' => 'Kukaqka Directory', 'type' => 'string', 'is_public' => true],
        ] as $setting) {
            Setting::query()->updateOrCreate(
                ['group' => $setting['group'], 'key' => $setting['key']],
                $setting,
            );
        }
    }

    private function seedPlans(): void
    {
        foreach ([
            ['name' => 'Free', 'price' => 0, 'features' => ['Basic listing', 'Manual approval']],
            ['name' => 'Premium', 'price' => 49, 'features' => ['Featured listing', 'Gallery', 'Priority approval']],
            ['name' => 'Business', 'price' => 99, 'features' => ['Multiple listings', 'Analytics ready', 'Priority support']],
        ] as $plan) {
            Plan::query()->firstOrCreate(
                ['slug' => Str::slug($plan['name'])],
                [
                    'name' => $plan['name'],
                    'price' => $plan['price'],
                    'currency' => 'USD',
                    'billing_cycle' => 'one_time',
                    'features' => $plan['features'],
                    'is_active' => true,
                ],
            );
        }
    }

    private function seedPages(): void
    {
        foreach (['Home', 'About', 'Contact', 'Pricing'] as $page) {
            Page::query()->firstOrCreate(
                ['slug' => Str::slug($page)],
                [
                    'title' => $page,
                    'template' => Str::slug($page),
                    'status' => 'published',
                    'published_at' => now(),
                    'content' => ['headline' => $page],
                ],
            );
        }
    }

    private function seedServices(): void
    {
        foreach (['Directory Listing', 'Business Promotion', 'City Discovery'] as $index => $service) {
            Service::query()->firstOrCreate(
                ['slug' => Str::slug($service)],
                [
                    'title' => $service,
                    'excerpt' => "{$service} service for Kukaqka.",
                    'status' => 'published',
                    'sort_order' => $index,
                    'published_at' => now(),
                ],
            );
        }
    }

    private function seedTeam(): void
    {
        TeamMember::query()->firstOrCreate(
            ['slug' => 'alexandra-rodriguez'],
            [
                'name' => 'Alexandra Rodriguez',
                'designation' => 'Directory Manager',
                'bio' => 'CMS-ready team profile for the public website.',
                'is_active' => true,
            ],
        );
    }

    private function seedListings(User $admin, array $countries, array $categories, array $tags): void
    {
        $samples = [
            [
                'slug' => 'bursa-modern-art-museum',
                'title' => 'Bursa Modern Art Museum',
                'city' => 'tirana-al',
                'category' => 'Arts and Culture',
                'address' => '234 Gallery Street, Tirana, Albania',
                'excerpt' => 'A polished cultural destination with contemporary exhibits.',
                'image' => 'https://cdn.prod.website-files.com/69dcdd3a161d4d87e4e259f3/69dcdd3a161d4d87e4e25b2a_Listings1.png',
            ],
            [
                'slug' => 'the-gourmet-haven-restaurant',
                'title' => 'The Gourmet Haven Restaurant',
                'city' => 'shkoder-al',
                'category' => 'Dining and Restaurants',
                'address' => '18 Foodie Lane, Shkoder, Albania',
                'excerpt' => 'A warm local restaurant with memorable service and city-friendly dining.',
                'image' => 'https://cdn.prod.website-files.com/69dcdd3a161d4d87e4e259f3/69dcdd3a161d4d87e4e25b28_Listings%202.png',
            ],
            [
                'slug' => 'tranquil-sunny-spa-and-wellness',
                'title' => 'Tranquil Sunny Spa and Wellness',
                'city' => 'lushnje-al',
                'category' => 'Sports and Fitness',
                'address' => '101 Wellness Road, Lushnje, Albania',
                'excerpt' => 'A restorative wellness place with calm treatments and fitness-friendly service.',
                'image' => 'https://cdn.prod.website-files.com/69dcdd3a161d4d87e4e259f3/69dcdd3a161d4d87e4e25b27_Listings%203.png',
            ],
            [
                'slug' => 'sunset-grill-bar-restaurant',
                'title' => 'Sunset Grill & Bar Restaurant',
                'city' => 'vlore-al',
                'category' => 'Dining and Restaurants',
                'address' => '42 Coastal Avenue, Vlore, Albania',
                'excerpt' => 'A casual food and evening spot close to the coast.',
                'image' => 'https://cdn.prod.website-files.com/69dcdd3a161d4d87e4e259f3/69dcdd3a161d4d87e4e25b17_Listings%2011.png',
            ],
            [
                'slug' => 'verona-sunny-spa-and-beauty',
                'title' => 'Verona Sunny Spa and Beauty',
                'city' => 'berlin-de',
                'category' => 'Shopping and Retail',
                'address' => '8 Beauty Platz, Berlin, Germany',
                'excerpt' => 'A beauty and retail destination with polished guest service.',
                'image' => 'https://cdn.prod.website-files.com/69dcdd3a161d4d87e4e259f3/69dcdd3a161d4d87e4e25b19_Listings10.png',
            ],
            [
                'slug' => 'turkish-and-islamic-arts-museum',
                'title' => 'Turkish and Islamic Arts Museum',
                'city' => 'prizren-ks',
                'category' => 'Wedding and Event Location',
                'address' => '890 Heritage Street, Prizren, Kosovo',
                'excerpt' => 'A distinctive cultural venue with elegant surroundings for memorable events.',
                'image' => 'https://cdn.prod.website-files.com/69dcdd3a161d4d87e4e259f3/69dcdd3a161d4d87e4e25b11_Listings%2012.png',
            ],
            [
                'slug' => 'rome-performing-party-center',
                'title' => 'Rome Performing Party Center',
                'city' => 'salzburg-at',
                'category' => 'Entertainment and Nightlife',
                'address' => '9 Celebration Street, Salzburg, Austria',
                'excerpt' => 'A lively entertainment venue for performances and city nights.',
                'image' => 'https://cdn.prod.website-files.com/69dcdd3a161d4d87e4e259f3/69dcdd3a161d4d87e4e25b21_Listings%206.png',
            ],
            [
                'slug' => 'luzern-premium-car-rental',
                'title' => 'Luzern Premium Car Rental',
                'city' => 'luzern-ch',
                'category' => 'Car Rental',
                'address' => '12 Transit Way, Luzern, Switzerland',
                'excerpt' => 'A convenient local car rental service for city and regional travel.',
                'image' => 'https://cdn.prod.website-files.com/69dcdd3a161d4d87e4e259f3/69dcdd3a161d4d87e4e25b23_Listings%205.png',
            ],
        ];

        foreach ($samples as $sample) {
            $city = City::query()->where('slug', $sample['city'])->first();

            $listing = Listing::query()->updateOrCreate(
                ['slug' => $sample['slug']],
                [
                    'owner_id' => $admin->id,
                    'city_id' => $city?->id,
                    'title' => $sample['title'],
                    'business_name' => $sample['title'],
                    'excerpt' => $sample['excerpt'],
                    'description' => $sample['excerpt'].' This place is managed from the backend CMS and available through the public API.',
                    'address' => $sample['address'],
                    'status' => 'published',
                    'is_featured' => true,
                    'published_at' => now(),
                    'approved_by' => $admin->id,
                    'approved_at' => now(),
                    'og_image' => $sample['image'],
                    'seo_title' => $sample['title'],
                    'seo_description' => $sample['excerpt'],
                ],
            );

            $listing->categories()->sync([$categories[$sample['category']]->id]);
            $listing->tags()->syncWithoutDetaching([$tags['featured']->id, $tags['popular']->id]);
        }
    }

    private function seedPosts(User $admin, array $categories, array $tags): void
    {
        $category = Category::query()->where('type', 'blog')->where('slug', 'city-life')->first();

        $post = Post::query()->firstOrCreate(
            ['slug' => 'diverse-communities-celebrating-the-tapestry-of-city-life'],
            [
                'author_id' => $admin->id,
                'category_id' => $category?->id,
                'title' => 'Diverse Communities: Celebrating the Tapestry of City Life.',
                'excerpt' => 'Celebrating the tapestry of city life through local discovery.',
                'content' => 'CMS-managed blog content ready for frontend API consumption.',
                'status' => 'published',
                'published_at' => now(),
            ],
        );

        $post->tags()->syncWithoutDetaching([$tags['featured']->id]);
    }
}
