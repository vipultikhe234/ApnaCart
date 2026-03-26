<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use App\Traits\HasRestaurantFilter;

class Order extends Model
{
    use HasFactory, HasRestaurantFilter;

    const STATUS_PLACED = 'placed';
    const STATUS_ACCEPTED = 'accepted';
    const STATUS_PREPARING = 'preparing';
    const STATUS_READY = 'ready';
    const STATUS_OUT_FOR_DELIVERY = 'out_for_delivery';
    const STATUS_DELIVERED = 'delivered';
    const STATUS_PICKED_UP = 'picked_up';
    const STATUS_CANCELLED = 'cancelled';

    const TYPE_DELIVERY = 'delivery';
    const TYPE_PICKUP = 'pickup';

    protected $fillable = [
        'user_id',
        'restaurant_id', // keeping it for compatibility with existing DB
        'rider_id',
        'coupon_id',
        'total_price',
        'discount',
        'address',
        'payment_method',
        'status',
        'payment_status',
        'order_type',
        'estimated_delivery_time',
        'actual_delivery_time',
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

    public function payment()
    {
        return $this->hasOne(Payment::class);
    }

    public function rider()
    {
        return $this->belongsTo(User::class, 'rider_id');
    }
}
