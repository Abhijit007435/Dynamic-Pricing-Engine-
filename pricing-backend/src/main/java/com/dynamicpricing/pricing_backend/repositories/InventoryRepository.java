package com.dynamicpricing.pricing_backend.repositories;

import com.dynamicpricing.pricing_backend.models.Inventory;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InventoryRepository extends MongoRepository<Inventory, String> {
}