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
    /**
     * Run the database seeders.
     *
     * Seeds the database with test users, roles, permissions, locations,
     * categories, listings, and blog posts for development and testing.
     */
    public function run(): void
    {
        // Step 1: Create roles and permissions
        $this->seedRolesAndPermissions();

        // Step 2: Create test users with different roles
        $superAdmin = $this->createUser(
            'superadmin@kukaqka.com',
            'Super Admin',
            '+1 (555) 123-0000',
            'password'
        );
        $superAdmin->assignRole('super-admin');

        // Create Admin (fallback for ADMIN_EMAIL env var)
        $admin = $this->createUser(
            env('ADMIN_EMAIL', 'admin@kukaqka.com'),
            env('ADMIN_NAME', 'Admin User'),
            '+1 (555) 234-0000',
            env('ADMIN_PASSWORD', 'password')
        );
        $admin->assignRole('admin');

        // Create Staff user for testing
        $staff = $this->createUser(
            'staff@kukaqka.com',
            'Staff Editor',
            '+1 (555) 345-0000',
            'password'
        );
        $staff->assignRole('staff');

        // Create Client user for testing
        $client = $this->createUser(
            'client@kukaqka.com',
            'Client Account',
            '+1 (555) 456-0000',
            'password'
        );
        $client->assignRole('client');

        // Step 3: Seed locations and categories
        $countries = $this->seedLocations();
        $categories = $this->seedCategories();
        $tags = $this->seedTags();

        // Step 4: Seed system configuration
        $this->seedSettings();
        $this->seedPlans();
        $this->seedPages();
        $this->seedServices();
        $this->seedTeam();

        // Step 5: Seed sample content
        $this->seedListings($admin, $countries, $categories, $tags);
        $this->seedPosts($admin, $categories, $tags);
        $this->seedArticles($admin);
        $this->seedMedia();
        $this->seedNewsletterSubscribers();

        $this->command->info('Database seeding completed successfully!');
        $this->command->table(['Email', 'Password', 'Role'], [
            ['superadmin@kukaqka.com', 'password', 'Super Admin'],
            ['admin@kukaqka.com', 'password', 'Admin'],
            ['staff@kukaqka.com', 'password', 'Staff'],
            ['client@kukaqka.com', 'password', 'Client'],
        ]);
    }

    /**
     * Create a user with basic profile information.
     */
    private function createUser(
        string $email,
        string $name,
        string $phone,
        string $password
    ): User {
        return User::query()->firstOrCreate(
            ['email' => $email],
            [
                'name' => $name,
                'email' => $email,
                'password' => Hash::make($password),
                'phone' => $phone,
                'status' => 'active',
                'email_verified_at' => now(),
            ],
        );
    }

    /**
     * Seed roles and permissions using Spatie Permissions.
     *
     * Creates 4 roles with specific permission sets:
     * - super-admin: Full system access (all permissions)
     * - admin: All permissions except role deletion
     * - staff: Limited permissions for content management
     * - client: Minimal permissions for viewing only
     */
    private function seedRolesAndPermissions(): void
    {
        // Define all available permissions
        $permissions = [
            // User management
            'users.view', 'users.create', 'users.update', 'users.delete',
            // Role management
            'roles.view', 'roles.create', 'roles.update', 'roles.delete',
            // Listing management
            'listings.view', 'listings.create', 'listings.update', 'listings.delete',
            'listings.approve', 'listings.publish',
            // Content management
            'categories.manage', 'posts.manage', 'pages.manage', 'services.manage',
            // Media & settings
            'media.manage', 'settings.manage',
            // Payments
            'payments.view', 'payments.refund',
        ];

        // Create all permissions
        foreach ($permissions as $permission) {
            Permission::query()->firstOrCreate(
                ['name' => $permission, 'guard_name' => 'web'],
                ['name' => $permission, 'guard_name' => 'web']
            );
        }

        // Create roles
        $superAdmin = Role::query()->firstOrCreate(
            ['name' => 'super-admin', 'guard_name' => 'web'],
            ['name' => 'super-admin', 'guard_name' => 'web']
        );
        $admin = Role::query()->firstOrCreate(
            ['name' => 'admin', 'guard_name' => 'web'],
            ['name' => 'admin', 'guard_name' => 'web']
        );
        $staff = Role::query()->firstOrCreate(
            ['name' => 'staff', 'guard_name' => 'web'],
            ['name' => 'staff', 'guard_name' => 'web']
        );
        $client = Role::query()->firstOrCreate(
            ['name' => 'client', 'guard_name' => 'web'],
            ['name' => 'client', 'guard_name' => 'web']
        );
        $user = Role::query()->firstOrCreate(
            ['name' => 'user', 'guard_name' => 'web'],
            ['name' => 'user', 'guard_name' => 'web']
        );

        // Assign permissions to roles
        // Super Admin: All permissions
        $superAdmin->syncPermissions(Permission::all());

        // Admin: All except role deletion
        $admin->syncPermissions(
            Permission::query()->whereNotIn('name', ['roles.delete'])->get()
        );

        // Staff: Content management permissions
        $staffPerms = Permission::whereIn('name', [
            'listings.view', 'listings.create', 'listings.update', 'listings.approve', 'listings.publish',
            'posts.manage', 'pages.manage', 'categories.manage',
            'media.manage',
        ])->get();
        $staff->syncPermissions($staffPerms);

        // Client: View and create listings
        $clientPerms = Permission::whereIn('name', [
            'listings.view', 'listings.create',
        ])->get();
        $client->syncPermissions($clientPerms);

        // User (standard registered users): Minimal view permissions
        $userPerms = Permission::whereIn('name', [
            'listings.view',
        ])->get();
        $user->syncPermissions($userPerms);
    }

    /**
     * Seed countries and cities.
     *
     * Creates test locations in Balkans and Central Europe:
     * - 6 countries (Albania, Kosovo, Macedonia, Germany, Austria, Switzerland)
     * - 10+ cities for testing location-based features
     *
     * @return array Array of Country models keyed by ISO-2 code
     */
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

    /**
     * Seed listing and blog categories.
     *
     * Creates 8 listing categories and 3 blog categories for organizing content:
     *
     * Listing Categories:
     * - Arts and Culture, Dining, Sports, Shopping, Travel, Entertainment, Events, Car Rental
     *
     * Blog Categories:
     * - City Life, Travelling, Artistry
     *
     * @return array Array of Category models keyed by category name
     */
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

    /**
     * Seed system settings.
     *
     * Initializes basic site configuration:
     * - Site name: Kukaqka
     * - Site URL: http://kukaqka.com
     * - SEO default title: Kukaqka Directory
     */
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

    /**
     * Seed sample listings for testing and development.
     *
     * Creates 8 realistic business listings across various categories:
     * - Museums, Restaurants, Spas, Bars, Shops, Event Venues, Entertainment, Car Rentals
     *
     * All listings are marked as published and featured.
     *
     * @param User $admin The admin user who owns the listings
     * @param array $countries Array of Country models
     * @param array $categories Array of Category models
     * @param array $tags Array of Tag models
     */
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

    /**
     * Seed sample blog posts.
     *
     * Creates a sample blog post in the "City Life" category about celebrating
     * diverse communities and local discovery.
     *
     * @param User $admin The admin user who authors the post
     * @param array $categories Array of Category models (not used here but available)
     * @param array $tags Array of Tag models for tagging content
     */
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

    /**
     * Seed blog articles with authors and categories.
     */
    private function seedArticles(User $admin): void
    {
        // Create authors
        $authors = [];
        foreach (['John Smith', 'Sarah Johnson', 'Mike Chen'] as $name) {
            $authors[] = \App\Models\Author::query()->firstOrCreate(
                ['slug' => Str::slug($name)],
                [
                    'name' => $name,
                    'email' => Str::slug($name) . '@kukaqka.com',
                    'bio' => 'Experienced writer and content creator',
                    'avatar' => null,
                ],
            );
        }

        // Create article categories
        $articleCategories = [];
        foreach (['Technology', 'Travel', 'Lifestyle', 'Business'] as $name) {
            $articleCategories[$name] = \App\Models\ArticleCategory::query()->firstOrCreate(
                ['slug' => Str::slug($name)],
                ['name' => $name, 'description' => $name . ' articles and insights'],
            );
        }

        // Create sample articles
        $articles = [
            [
                'title' => 'The Future of Travel Technology',
                'slug' => 'future-travel-technology',
                'excerpt' => 'Exploring emerging technologies transforming the travel industry',
                'content' => 'Travel technology is evolving rapidly with AI, IoT, and blockchain innovations...',
                'author' => $authors[0],
                'category' => $articleCategories['Technology'],
            ],
            [
                'title' => 'Hidden Gems in European Cities',
                'slug' => 'hidden-gems-european-cities',
                'excerpt' => 'Discover lesser-known attractions in popular European destinations',
                'content' => 'Beyond the famous landmarks lie incredible experiences waiting to be discovered...',
                'author' => $authors[1],
                'category' => $articleCategories['Travel'],
            ],
            [
                'title' => 'Sustainable Business Practices',
                'slug' => 'sustainable-business-practices',
                'excerpt' => 'How modern businesses are adopting eco-friendly strategies',
                'content' => 'Sustainability is no longer optional but essential for business success...',
                'author' => $authors[2],
                'category' => $articleCategories['Business'],
            ],
            [
                'title' => 'Work-Life Balance in Remote Era',
                'slug' => 'work-life-balance-remote',
                'excerpt' => 'Tips for maintaining healthy boundaries while working from home',
                'content' => 'Remote work offers flexibility but requires discipline and boundaries...',
                'author' => $authors[0],
                'category' => $articleCategories['Lifestyle'],
            ],
        ];

        foreach ($articles as $data) {
            \App\Models\Article::query()->firstOrCreate(
                ['slug' => $data['slug']],
                [
                    'title' => $data['title'],
                    'slug' => $data['slug'],
                    'excerpt' => $data['excerpt'],
                    'content' => $data['content'],
                    'featured_image' => null,
                    'author_id' => $data['author']->id,
                    'category_id' => $data['category']->id,
                    'status' => 'published',
                    'created_by' => $admin->id,
                ],
            );
        }
    }

    /**
     * Seed custom media files and link them to listings.
     */
    private function seedMedia(): void
    {
        $mediaFiles = [
            [
                'file_name' => 'museum.jpg',
                'stored_name' => 'museum_' . time() . '.jpg',
                'file_path' => 'uploads/listings/museum.jpg',
                'mime_type' => 'image/jpeg',
                'file_type' => 'image',
                'file_size' => 1024000,
                'extension' => 'jpg',
                'alt_text' => 'Museum Exterior',
                'title' => 'Museum',
                'listing_slug' => 'bursa-modern-art-museum',
            ],
            [
                'file_name' => 'restaurant.jpg',
                'stored_name' => 'restaurant_' . time() . '.jpg',
                'file_path' => 'uploads/listings/restaurant.jpg',
                'mime_type' => 'image/jpeg',
                'file_type' => 'image',
                'file_size' => 1024000,
                'extension' => 'jpg',
                'alt_text' => 'Restaurant Interior',
                'title' => 'Restaurant',
                'listing_slug' => 'the-gourmet-haven-restaurant',
            ],
            [
                'file_name' => 'spa.jpg',
                'stored_name' => 'spa_' . time() . '.jpg',
                'file_path' => 'uploads/listings/spa.jpg',
                'mime_type' => 'image/jpeg',
                'file_type' => 'image',
                'file_size' => 1024000,
                'extension' => 'jpg',
                'alt_text' => 'Spa Relaxation',
                'title' => 'Spa',
                'listing_slug' => 'tranquil-sunny-spa-and-wellness',
            ],
        ];

        foreach ($mediaFiles as $data) {
            $listing_slug = $data['listing_slug'];
            unset($data['listing_slug']);

            $media = \App\Models\CustomMedia::query()->firstOrCreate(
                ['file_name' => $data['file_name']],
                array_merge($data, [
                    'status' => 'active',
                    'related_module' => 'listing',
                ]),
            );

            // Link media to listing
            $listing = \App\Models\Listing::where('slug', $listing_slug)->first();
            if ($listing) {
                $listing->mediaFiles()->syncWithoutDetaching([$media->id]);
            }
        }
    }

    /**
     * Seed newsletter subscribers.
     */
    private function seedNewsletterSubscribers(): void
    {
        $emails = [
            'subscriber1@example.com',
            'subscriber2@example.com',
            'subscriber3@example.com',
            'subscriber4@example.com',
            'subscriber5@example.com',
        ];

        foreach ($emails as $email) {
            \App\Models\NewsletterSubscriber::query()->firstOrCreate(
                ['email' => $email],
                [
                    'email' => $email,
                    'status' => 'subscribed',
                    'subscribed_at' => now(),
                ],
            );
        }
    }
}
