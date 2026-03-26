<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use App\Traits\HasRestaurantFilter;

class Order extends Model
{
    use HasFactory, HasRestaurantFilter;

    // Final Status Flow (Production Grade)
    const STATUS_PLACED = 'placed';
    const STATUS_ACCEPTED = 'accepted';
    const STATUS_PREPARING = 'preparing';
    const STATUS_READY_FOR_PICKUP = 'ready_for_pickup';
    const STATUS_OUT_FOR_DELIVERY = 'out_for_delivery';
    const STATUS_DELIVERED = 'delivered';
    const STATUS_CANCELLED = 'cancelled';
    const STATUS_FAILED = 'failed';

    const TYPE_DELIVERY = 'delivery';
    const TYPE_PICKUP = 'pickup';

    protected $fillable = [
        'order_number',
        'idempotency_key',
        'user_id',
        'restaurant_id',
        'rider_id',
        'coupon_id',
        'total_amount',
        'subtotal_amount',
        'tax_amount',
        'delivery_fee',
        'packing_charge',
        'platform_fee',
        'discount_amount',
        'currency',
        'address_id',
        'address', // snapshot
        'payment_method',
        'status',
        'payment_status',
        'payment_expires_at',
        'total_items',
        'total_quantity',
        'order_type',
        'notes',
        'cancellation_reason',
        'estimated_delivery_time',
        'actual_delivery_time',
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'subtotal_amount' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'delivery_fee' => 'decimal:2',
        'packing_charge' => 'decimal:2',
        'platform_fee' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'payment_expires_at' => 'datetime',
        'placed_at' => 'datetime',
        'delivered_at' => 'datetime',
        'cancelled_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function restaurant()
    {
        return $this->belongsTo(Restaurant::class);
    }

    public function coupon()
    {
        return $this->belongsTo(Coupon::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function logs()
    {
        return $this->hasMany(OrderStatusLog::class);
    }

    public function payment()
    {
        return $this->hasOne(Payment::class);
    }

    public function rider()
    {
        return $this->belongsTo(User::class, 'rider_id');
    }

    /**
     * Scope for active orders (not delivered or cancelled).
     */
    public function scopeActive($query)
    {
        return $query->whereNotIn('status', [self::STATUS_DELIVERED, self::STATUS_CANCELLED, self::STATUS_FAILED]);
    }
}
