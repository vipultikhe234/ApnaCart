<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'type', // fixed or percentage
        'value',
        'min_order_amount',
        'expires_at',
        'is_active',
        'restaurant_id'
    ];

    public function restaurant()
    {
        return $this->belongsTo(Restaurant::class);
    }

    protected $casts = [
        'expires_at' => 'datetime',
        'is_active' => 'boolean'
    ];
}
