package com.dynamicpricing.pricing_backend.services;

import com.dynamicpricing.pricing_backend.models.Inventory;
import com.dynamicpricing.pricing_backend.repositories.InventoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class InventoryService {

    @Autowired
    private InventoryRepository repository;

    public List<Inventory> getAllInventory() {
        return repository.findAll();
    }

    public Optional<Inventory> getInventoryById(@NonNull String id) {
        return repository.findById(id);
    }

    public Inventory saveInventory(Inventory inventory) {
        inventory.setUpdatedAt(LocalDateTime.now());
        return repository.save(inventory);
    }

    public Inventory updateInventory(@NonNull String id, Inventory updatedData) {
        Optional<Inventory> existingInventory = repository.findById(id);

        if (existingInventory.isPresent()) {
            Inventory inventory = existingInventory.get();

            inventory.setProductId(updatedData.getProductId());
            inventory.setAvailableQuantity(updatedData.getAvailableQuantity());
            inventory.setUpdatedAt(LocalDateTime.now());

            return repository.save(inventory);
        }

        throw new RuntimeException("Inventory record not found with id: " + id);
    }

    public void deleteInventory(@NonNull String id) {
        repository.deleteById(id);
    }
}