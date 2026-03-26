<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use App\Traits\HasRestaurantFilter;

class Product extends Model
{
    use HasFactory, HasRestaurantFilter;

    protected $fillable = [
        'category_id',
        'restaurant_id',
        'name',
        'description',
        'has_variants',
        'price',
        'discount_price',
        'image',
        'stock',
        'is_available',
        'is_active',
    ];

    protected $casts = [
        'has_variants' => 'boolean',
        'is_available' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function restaurant()
    {
        return $this->belongsTo(Restaurant::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    /**
     * Get the variants for the product.
     */
    public function variants()
    {
        return $this->hasMany(ProductVariant::class);
    }

    /**
     * Scope for active products.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
