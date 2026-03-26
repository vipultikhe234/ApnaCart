<?php

namespace App\Http\Controllers\Analytics;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Models\Restaurant;
use Illuminate\Http\Request;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function stats(Request $request)
    {
        $user = $request->user();
        $targetId = $request->query('restaurant_id');

        // Logic branching: if Merchant, ignore targetId and use their own. If Admin, use optional targetId.
        if ($user->role === 'merchant') {
            $restaurantId = $user->restaurant?->id;
            if (!$restaurantId) return response()->json(['message' => 'No restaurant context'], 404);
            $targetId = $restaurantId;
        }

        if ($targetId) {
            // MERCHANT or ADMIN FILTERED STATS
            $totalOrders   = Order::byRestaurant($targetId)->count();
            $totalRevenue  = Order::byRestaurant($targetId)->whereIn('payment_status', ['paid'])->sum('total_price');
            $totalProducts = Product::byRestaurant($targetId)->count();
            $recentOrders  = Order::byRestaurant($targetId)->where('created_at', '>=', Carbon::now()->subDays(7))->count();

            $salesTrend = Order::byRestaurant($targetId)
                ->selectRaw('DATE(created_at) as date, SUM(total_price) as total, COUNT(*) as count')
                ->where('created_at', '>=', Carbon::now()->subDays(7))
                ->groupBy('date')
                ->orderBy('date', 'asc')
                ->get();

            $statusSummary = Order::byRestaurant($targetId)
                ->selectRaw('status, COUNT(*) as count')
                ->groupBy('status')
                ->pluck('count', 'status');

            $restaurant = Restaurant::find($targetId);

            return response()->json([
                'context'             => $restaurant ? $restaurant->name : 'Merchant Node',
                'total_orders'        => $totalOrders,
                'total_revenue'       => (float) $totalRevenue,
                'total_products'      => $totalProducts,
                'recent_orders_count' => $recentOrders,
                'sales_trend'         => $salesTrend,
                'status_summary'      => $statusSummary,
            ]);
        }

        // GLOBAL ADMIN STATS (Only when Admin and NO restaurant_id filter)
        $totalOrders   = Order::count();
        $totalRevenue  = Order::whereIn('payment_status', ['paid'])->sum('total_price');
        $totalDiscounts = Order::sum('discount');
        $totalUsers    = User::where('role', 'customer')->count();
        $totalProducts = Product::count();
        $totalRestaurants = Restaurant::count();
        $recentOrders  = Order::where('created_at', '>=', Carbon::now()->subDays(7))->count();

        $salesTrend = Order::selectRaw('DATE(created_at) as date, SUM(total_price) as total, COUNT(*) as count')
            ->where('created_at', '>=', Carbon::now()->subDays(7))
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get();

        $statusSummary = Order::selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        return response()->json([
            'context'             => 'Global Enterprise',
            'total_orders'        => $totalOrders,
            'total_revenue'       => (float) $totalRevenue,
            'total_discounts'     => (float) $totalDiscounts,
            'total_users'         => $totalUsers,
            'total_products'      => $totalProducts,
            'total_restaurants'   => $totalRestaurants,
            'recent_orders_count' => $recentOrders,
            'sales_trend'         => $salesTrend,
            'status_summary'      => $statusSummary,
        ]);
    }
}
