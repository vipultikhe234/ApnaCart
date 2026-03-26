<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use App\Http\Resources\CategoryResource;
use App\Http\Requests\CategoryRequest;
use App\Services\Inventory\CategoryService;
use App\Services\Identity\FCMService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class CategoryController extends Controller
{
    public function __construct(
        protected CategoryService $service,
        protected FCMService $fcmService
    ) {}

    public function index(Request $request)
    {
        $role = $request->user('sanctum')?->role ?? 'guest';
        $targetId = $request->query('restaurant_id');

        $cacheKey = "categories_r_" . ($targetId ?? 'all') . "_role_" . $role;

        return Cache::remember($cacheKey, 3600, function () use ($targetId) {
            $categories = $this->service->getAllCategories($targetId);
            return CategoryResource::collection($categories);
        });
    }

    private function clearCategoryCache($restaurantId = null)
    {
        $roles = ['guest', 'merchant', 'admin', 'super_admin', 'Admin', 'Super Admin'];
        foreach ($roles as $role) {
            if ($restaurantId) {
                Cache::forget("categories_r_{$restaurantId}_role_{$role}");
            }
            Cache::forget("categories_r_all_role_{$role}");
            Cache::forget("categories_r__role_{$role}");
        }
        Cache::forget('categories_active');
    }

    public function store(CategoryRequest $request)
    {
        $data = $request->validated();
        if ($request->user()->role === 'merchant') {
            $data['restaurant_id'] = $request->user()->restaurant?->id;
        } elseif (in_array($request->user()->role, ['admin', 'super_admin', 'Admin', 'Super Admin']) && $request->has('restaurant_id')) {
            $data['restaurant_id'] = $request->restaurant_id;
        }

        $category = $this->service->createCategory($data);
        $this->clearCategoryCache($category->restaurant_id);

        // Broadcast refresh
        $this->fcmService->broadcastData(['type' => 'refresh_categories', 'action' => 'created', 'id' => (string)$category->id]);

        return new CategoryResource($category);
    }

    public function update(CategoryRequest $request, $id)
    {
        $category = Category::find($id);
        if (!$category) return response()->json(['message' => 'Category not found'], 404);

        if ($request->user()->role === 'merchant' && $category->restaurant_id !== $request->user()->restaurant?->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $this->service->updateCategory($id, $request->validated());
        $this->clearCategoryCache($category->restaurant_id);

        // Broadcast refresh
        $this->fcmService->broadcastData(['type' => 'refresh_categories', 'action' => 'updated', 'id' => (string)$id]);

        return response()->json(['message' => 'Category updated successfully']);
    }

    public function destroy(Request $request, $id)
    {
        $category = Category::find($id);
        if (!$category) return response()->json(['message' => 'Category not found'], 404);

        if ($request->user()->role === 'merchant' && $category->restaurant_id !== $request->user()->restaurant?->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $resId = $category->restaurant_id;
        $this->service->deleteCategory($id);
        $this->clearCategoryCache($resId);

        // Broadcast refresh
        $this->fcmService->broadcastData(['type' => 'refresh_categories', 'action' => 'deleted', 'id' => (string)$id]);

        return response()->json(['message' => 'Category deleted']);
    }
}
