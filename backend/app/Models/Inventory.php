<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Inventory extends Model
{
    /**
     * The table associated with the model.
     * 
     * @var string
     */
    protected $table = 'inventories';

    protected $fillable = [
        'product_variant_id',
        'restaurant_id',
        'stock',
        'reserved_stock',
        'is_available',
    ];

    protected $casts = [
        'stock' => 'integer',
        'reserved_stock' => 'integer',
        'is_available' => 'boolean',
    ];

    /**
     * Get the variant associated with the inventory.
     */
    public function variant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class, 'product_variant_id');
    }

    /**
     * Get the restaurant (shop) that owns the inventory.
     */
    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(Restaurant::class);
    }

    /**
     * Scope for available stock (Actual stock - reserved stock).
     */
    public function scopeAvailable($query)
    {
        return $query->where('is_available', true)
                     ->whereRaw('stock - reserved_stock > 0');
    }
}
