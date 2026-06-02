<?php

namespace App\Http\Controllers\Admin;

use App\Models\Category;
use App\Models\ContactMessage;
use App\Models\Listing;
use App\Models\NewsletterSubscriber;
use App\Models\Page;
use App\Models\Post;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

class GlobalSearchController
{
    public function index(Request $request)
    {
        $query = $this->sanitizeQuery($request);
        $limit = $this->resolveLimit($request);

        if ($query === '') {
            return response()->json([
                'query' => $query,
                'results' => [],
            ]);
        }

        $results = collect()
            ->concat($this->searchListings($query, $limit))
            ->concat($this->searchPosts($query, $limit))
            ->concat($this->searchPages($query, $limit))
            ->concat($this->searchUsers($query, $limit))
            ->concat($this->searchCategories($query, $limit))
            ->concat($this->searchSubscribers($query, $limit))
            ->concat($this->searchMessages($query, $limit))
            ->sortByDesc('created_at')
            ->values()
            ->take($limit * 4)
            ->values();

        return response()->json([
            'query' => $query,
            'results' => $results,
        ]);
    }

    private function sanitizeQuery(Request $request): string
    {
        return trim((string) $request->input('q', ''));
    }

    private function resolveLimit(Request $request): int
    {
        return max(3, min((int) $request->input('limit', 8), 20));
    }

    private function searchListings(string $query, int $limit): Collection
    {
        return Listing::query()
            ->select(['id', 'title', 'status', 'created_at'])
            ->where(function (Builder $builder) use ($query): void {
                $builder->where('title', 'like', "%{$query}%")
                    ->orWhere('business_name', 'like', "%{$query}%")
                    ->orWhere('slug', 'like', "%{$query}%");
            })
            ->latest('created_at')
            ->limit($limit)
            ->get()
            ->map(fn(Listing $listing) => $this->resultItem(
                $listing->id,
                'listing',
                $listing->title,
                ucfirst((string) $listing->status),
                '/listings',
                optional($listing->created_at)?->toISOString(),
            ));
    }

    private function searchPosts(string $query, int $limit): Collection
    {
        return Post::query()
            ->select(['id', 'title', 'status', 'created_at'])
            ->where(function (Builder $builder) use ($query): void {
                $builder->where('title', 'like', "%{$query}%")
                    ->orWhere('slug', 'like', "%{$query}%")
                    ->orWhere('excerpt', 'like', "%{$query}%");
            })
            ->latest('created_at')
            ->limit($limit)
            ->get()
            ->map(fn(Post $post) => $this->resultItem(
                $post->id,
                'post',
                $post->title,
                'Post',
                '/content',
                optional($post->created_at)?->toISOString(),
            ));
    }

    private function searchPages(string $query, int $limit): Collection
    {
        return Page::query()
            ->select(['id', 'title', 'status', 'created_at'])
            ->where(function (Builder $builder) use ($query): void {
                $builder->where('title', 'like', "%{$query}%")
                    ->orWhere('slug', 'like', "%{$query}%");
            })
            ->latest('created_at')
            ->limit($limit)
            ->get()
            ->map(fn(Page $page) => $this->resultItem(
                $page->id,
                'page',
                $page->title,
                'Page',
                '/content',
                optional($page->created_at)?->toISOString(),
            ));
    }

    private function searchUsers(string $query, int $limit): Collection
    {
        return User::query()
            ->select(['id', 'name', 'email', 'created_at'])
            ->where(function (Builder $builder) use ($query): void {
                $builder->where('name', 'like', "%{$query}%")
                    ->orWhere('email', 'like', "%{$query}%");
            })
            ->latest('created_at')
            ->limit($limit)
            ->get()
            ->map(fn(User $user) => $this->resultItem(
                $user->id,
                'user',
                $user->name,
                $user->email,
                '/users',
                optional($user->created_at)?->toISOString(),
            ));
    }

    private function searchCategories(string $query, int $limit): Collection
    {
        return Category::query()
            ->select(['id', 'name', 'type', 'created_at'])
            ->where('name', 'like', "%{$query}%")
            ->latest('created_at')
            ->limit($limit)
            ->get()
            ->map(fn(Category $category) => $this->resultItem(
                $category->id,
                'category',
                $category->name,
                ucfirst((string) $category->type),
                '/categories',
                optional($category->created_at)?->toISOString(),
            ));
    }

    private function searchSubscribers(string $query, int $limit): Collection
    {
        return NewsletterSubscriber::query()
            ->select(['id', 'email', 'source', 'created_at'])
            ->where('email', 'like', "%{$query}%")
            ->latest('created_at')
            ->limit($limit)
            ->get()
            ->map(fn(NewsletterSubscriber $subscriber) => $this->resultItem(
                $subscriber->id,
                'subscriber',
                $subscriber->email,
                ucfirst(str_replace('-', ' ', (string) $subscriber->source)),
                '/subscriptions',
                optional($subscriber->created_at)?->toISOString(),
            ));
    }

    private function searchMessages(string $query, int $limit): Collection
    {
        return ContactMessage::query()
            ->select(['id', 'name', 'email', 'subject', 'created_at'])
            ->where(function (Builder $builder) use ($query): void {
                $builder->where('name', 'like', "%{$query}%")
                    ->orWhere('email', 'like', "%{$query}%")
                    ->orWhere('subject', 'like', "%{$query}%");
            })
            ->latest('created_at')
            ->limit($limit)
            ->get()
            ->map(fn(ContactMessage $message) => $this->resultItem(
                $message->id,
                'message',
                $message->subject ?: $message->name,
                $message->email,
                '/dashboard',
                optional($message->created_at)?->toISOString(),
            ));
    }

    private function resultItem(
        int $id,
        string $type,
        string $label,
        string $meta,
        string $to,
        ?string $createdAt,
    ): array {
        return [
            'id' => $id,
            'type' => $type,
            'label' => $label,
            'meta' => $meta,
            'to' => $to,
            'created_at' => $createdAt,
        ];
    }
}
