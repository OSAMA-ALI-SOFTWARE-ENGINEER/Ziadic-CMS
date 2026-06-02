<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property string $name
 * @property string|null $iso2
 * @property string|null $iso3
 * @property string|null $phone_code
 * @property bool $is_active
 * @property int|null $places_count
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 */
class Country extends Model
{
    protected $fillable = ['name', 'iso2', 'iso3', 'phone_code', 'is_active'];

    protected function casts(): array
    {
        return ['is_active' => 'boolean'];
    }

    public function cities(): HasMany
    {
        return $this->hasMany(City::class);
    }
}
