<?php

namespace App\Http\Controllers;

use App\Services\OrderService;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function __construct(
        protected OrderService $service
    ) {}

    /**
     * Store a newly created order in storage.
     */
    public function store(\App\Http\Requests\StoreOrderRequest $request)
    {

        try {
            $data = $request->all();
            $data['user_id'] = $request->user()->id;

            $result = $this->service->placeOrder($data, $request->items);

            return response()->json([
                'message' => 'Order placed successfully',
                'data'    => $result
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to place order: ' . $e->getMessage()
            ], 400);
        }
    }

    /**
     * Display a single order (Owner, Admin, or Merchant).
     */
    public function show(Request $request, $id)
    {
        $order = \App\Models\Order::with(['items.product', 'user', 'payment', 'restaurant'])->find($id);

        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        // Check permissions: Admin, the Customer who placed it, or the Merchant who owns the restaurant
        $isOwner = $order->user_id === $request->user()->id;
        $isAdmin = $request->user()->role === 'admin';
        $isMerchant = $request->user()->role === 'merchant' && $order->restaurant_id === $request->user()->restaurant?->id;

        if (!$isOwner && !$isAdmin && !$isMerchant) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json(['data' => $order]);
    }

    /**
     * Display a listing of orders (Admin, Merchant, or User specific).
     */
    public function index(Request $request)
    {
        if ($request->user()->role === 'admin') {
            $orders = $this->service->getOrders();
        } elseif ($request->user()->role === 'merchant') {
            $restaurantId = $request->user()->restaurant?->id;
            if (!$restaurantId) return response()->json(['data' => []]);
            $orders = \App\Models\Order::where('restaurant_id', $restaurantId)->with(['user', 'restaurant'])->latest()->get();
        } else {
            $orders = $this->service->getUserOrders($request->user()->id);
        }

        return response()->json(['data' => $orders]);
    }

    /**
     * Update the order status (Admin or Merchant).
     */
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:pending,preparing,dispatched,delivered,cancelled'
        ]);

        $order = \App\Models\Order::find($id);
        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        // Only Admin or the Merchant owning the restaurant can update status
        $isAdmin = $request->user()->role === 'admin';
        $isMerchant = $request->user()->role === 'merchant' && $order->restaurant_id === $request->user()->restaurant?->id;

        if (!$isAdmin && !$isMerchant) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        try {
            $order = $this->service->updateOrderStatus($id, $request->status);
            return response()->json([
                'message' => 'Order status updated to ' . $request->status,
                'data' => $order
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Update the payment status (Admin only).
     */
    public function updatePaymentStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:pending,paid,failed,refunded'
        ]);

        try {
            $order = $this->service->updatePaymentStatus($id, $request->status);

            if (!$order) {
                return response()->json(['message' => 'Order not found'], 404);
            }

            return response()->json([
                'message' => 'Payment status updated to ' . $request->status,
                'data' => $order
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Payment update failed: ' . $e->getMessage()
            ], 400);
        }
    }

    public function initiatePayment($id)
    {
        try {
            $result = $this->service->initiatePayment($id);
            return response()->json(['data' => $result]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }
}
