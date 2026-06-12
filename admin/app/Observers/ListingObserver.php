<?php

namespace App\Observers;

use App\Models\Listing;
use App\Support\ActivityLogger;
use Illuminate\Http\Request;

class ListingObserver
{
    public function created(Listing $listing)
    {
        ActivityLogger::log('listing.created', $listing, ['new' => $listing->toArray()], request());
    }

    public function updated(Listing $listing)
    {
        // compute diff
        ActivityLogger::log('listing.updated', $listing, ['new' => $listing->getChanges(), 'old' => []], request());
    }

    public function deleted(Listing $listing)
    {
        ActivityLogger::log('listing.deleted', $listing, ['old' => $listing->toArray()], request());
    }
}
