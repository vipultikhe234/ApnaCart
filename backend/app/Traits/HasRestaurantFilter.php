<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;

trait HasRestaurantFilter
{
    /**
     * Scope a query to only include records belonging to a specific restaurant.
     */
    public function scopeByRestaurant(Builder $query, ?int $restaurantId = null): Builder
    {
        $user = Auth::user();

        // 1. If explicit restaurantId provided (Admin choosing from dropdown)
        if ($restaurantId) {
            return $query->where('restaurant_id', $restaurantId);
        }

        // 2. If logged in as Merchant, auto-filter by their own node
        if ($user && $user->role === 'merchant') {
            $myRestaurant = $user->restaurant;
            if ($myRestaurant) {
                return $query->where('restaurant_id', $myRestaurant->id);
            }
            // If merchant has no restaurant, show nothing for safety
            return $query->where('restaurant_id', 0);
        }

        // 3. For Admin/SuperAdmin (without explicit ID) or Customers/Guests, show all
        return $query;
    }
}
