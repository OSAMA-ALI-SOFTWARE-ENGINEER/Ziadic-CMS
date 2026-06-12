<?php

namespace App\Observers;

use App\Models\ListingSubmission;
use App\Support\ActivityLogger;

class ListingSubmissionObserver
{
    public function created(ListingSubmission $submission)
    {
        ActivityLogger::log('listing.submitted', $submission, ['new' => $submission->toArray()], request());
    }

    public function updated(ListingSubmission $submission)
    {
        ActivityLogger::log('listing_submission.updated', $submission, ['new' => $submission->getChanges()], request());
    }

    public function deleted(ListingSubmission $submission)
    {
        ActivityLogger::log('listing_submission.deleted', $submission, ['old' => $submission->toArray()], request());
    }
}
