<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SubmittedListing extends Model
{
    use HasFactory;

    protected $table = 'submitted_listings';

    protected $fillable = [
        'title','slug','description','category_id','location','contact_name','contact_email','price','images','status','source','created_by'
    ];

    protected $casts = [
        'images' => 'array',
    ];
}
