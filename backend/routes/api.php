<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CouponController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\UploadController;
use App\Http\Controllers\StripeWebhookController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::get('/ping', function() { return response()->json(['status' => 'ok']); });

// Public Routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);
Route::get('/categories', [CategoryController::class, 'index']);
Route::post('/webhooks/stripe', [StripeWebhookController::class, 'handle']);

// Protected Management & User Routes
Route::middleware('auth:sanctum')->group(function () {
    // Shared Auth & Profile
    Route::get('/profile', [AuthController::class, 'profile']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/upload', [UploadController::class, 'store']);
    
    // Unified Role-Aware Operations (RBAC handled in Controllers)
    Route::get('/stats', [DashboardController::class, 'stats']);
    
    // Shared API for Products (Public GET is outside middleware)
    Route::post('/products', [ProductController::class, 'store']);
    Route::put('/products/{id}', [ProductController::class, 'update']);
    Route::delete('/products/{id}', [ProductController::class, 'destroy']);
    
    // Shared API for Categories
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::put('/categories/{id}', [CategoryController::class, 'update']);
    Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);
    
    // Shared API for Orders
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
    Route::post('/orders', [OrderController::class, 'store']); // Throttling can be added
    Route::patch('/orders/{id}/status', [OrderController::class, 'updateStatus']);
    Route::patch('/orders/{id}/payment-status', [OrderController::class, 'updatePaymentStatus']);
    
    // Shared API for Coupons
    Route::get('/coupons', [CouponController::class, 'index']);
    Route::post('/coupons', [CouponController::class, 'store']);
    Route::put('/coupons/{id}', [CouponController::class, 'update']);
    Route::delete('/coupons/{id}', [CouponController::class, 'destroy']);
    Route::post('/coupons/validate', [CouponController::class, 'validateCoupon']);

    // --- Admin-Only Special Ops ---
    Route::middleware('admin')->group(function () {
        Route::get('/admin/restaurants', [\App\Http\Controllers\RestaurantController::class, 'listAll']);
        Route::post('/admin/merchants', [\App\Http\Controllers\RestaurantController::class, 'store']);
        Route::put('/admin/merchants/{id}', [\App\Http\Controllers\RestaurantController::class, 'adminUpdate']);
        Route::patch('/admin/restaurants/{id}/toggle', [\App\Http\Controllers\RestaurantController::class, 'toggleStatus']);
        Route::get('/admin/users', [AuthController::class, 'listUsers']);
    });

    // --- Merchant-Only Special Ops ---
    Route::middleware('merchant')->group(function () {
        Route::get('/merchant/restaurant', [\App\Http\Controllers\RestaurantController::class, 'show']);
        Route::put('/merchant/restaurant', [\App\Http\Controllers\RestaurantController::class, 'update']);
    });

    // User extras
    Route::get('/addresses', [\App\Http\Controllers\UserAddressController::class, 'index']);
    Route::post('/addresses', [\App\Http\Controllers\UserAddressController::class, 'store']);
    Route::post('/products/{id}/reviews', [ProductController::class, 'addReview']);
    
    // Stripe & FCM
    Route::post('/payments/confirm', [StripeWebhookController::class, 'confirmPayment']);
    Route::post('/save-fcm-token', [\App\Http\Controllers\FCMController::class, 'saveToken']);
    Route::post('/remove-fcm-token', [\App\Http\Controllers\FCMController::class, 'removeToken']);
});
