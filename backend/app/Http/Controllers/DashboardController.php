<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Request;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function stats(Request $request)
    {
        $user = $request->user();
        
        if ($user->role === 'merchant') {
            $restaurantId = $user->restaurant?->id;
            if (!$restaurantId) return response()->json(['message' => 'No restaurant context'], 404);

            $totalOrders   = Order::where('restaurant_id', $restaurantId)->count();
            $totalRevenue  = Order::where('restaurant_id', $restaurantId)->whereIn('payment_status', ['paid'])->sum('total_price');
            $totalProducts = Product::where('restaurant_id', $restaurantId)->count();
            $recentOrders  = Order::where('restaurant_id', $restaurantId)->where('created_at', '>=', Carbon::now()->subDays(7))->count();

            $salesTrend = Order::selectRaw('DATE(created_at) as date, SUM(total_price) as total, COUNT(*) as count')
                ->where('restaurant_id', $restaurantId)
                ->where('created_at', '>=', Carbon::now()->subDays(7))
                ->groupBy('date')
                ->orderBy('date', 'asc')
                ->get();

            $statusSummary = Order::where('restaurant_id', $restaurantId)
                ->selectRaw('status, COUNT(*) as count')
                ->groupBy('status')
                ->pluck('count', 'status');

            return response()->json([
                'total_orders'        => $totalOrders,
                'total_revenue'       => (float) $totalRevenue,
                'total_products'      => $totalProducts,
                'recent_orders_count' => $recentOrders,
                'sales_trend'         => $salesTrend,
                'status_summary'      => $statusSummary,
            ]);
        }

        // Admin Stats (Global)
        $totalOrders   = Order::count();
        $totalRevenue  = Order::whereIn('payment_status', ['paid'])->sum('total_price');
        $totalDiscounts = Order::sum('discount');
        $totalUsers    = User::where('role', 'customer')->count();
        $totalProducts = Product::count();
        $totalRestaurants = \App\Models\Restaurant::count();
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
