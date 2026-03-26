<?php

namespace App\Services\Inventory;

use App\Repositories\ProductRepository;

class ProductService
{
    public function __construct(
        protected ProductRepository $repository
    ) {}

    public function getAllProducts($restaurantId = null)
    {
        return $this->repository->getAll($restaurantId);
    }

    public function getProductById(int $id)
    {
        return $this->repository->findById($id);
    }

    public function createProduct(array $data)
    {
        return $this->repository->create($data);
    }

    public function updateProduct(int $id, array $data)
    {
        return $this->repository->update($id, $data);
    }

    public function deleteProduct(int $id)
    {
        return $this->repository->delete($id);
    }
}
