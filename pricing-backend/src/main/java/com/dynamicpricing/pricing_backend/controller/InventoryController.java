package com.dynamicpricing.pricing_backend.controller;

import com.dynamicpricing.pricing_backend.models.Inventory;
import com.dynamicpricing.pricing_backend.repositories.InventoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/inventory")
public class InventoryController {

    @Autowired
    private InventoryRepository repository;

    // GET /inventory - View inventory levels [cite: 112, 160]
    @GetMapping
    public List<Inventory> getAllInventory() {
        return repository.findAll();
    }

    // POST /inventory - Track initial stock [cite: 110, 159]
    @PostMapping
    public Inventory addInventory(@RequestBody Inventory inventory) {
        inventory.setUpdatedAt(LocalDateTime.now());
        return repository.save(inventory);
    }

    // PUT /inventory/:id - Update available stock [cite: 111, 161]
    @PutMapping("/{id}")
    public Inventory updateInventory(@PathVariable String id, @RequestBody Inventory updatedData) {
        Optional<Inventory> existingInventory = repository.findById(id);

        if (existingInventory.isPresent()) {
            Inventory inventory = existingInventory.get();
            inventory.setAvailableQuantity(updatedData.getAvailableQuantity());
            inventory.setUpdatedAt(LocalDateTime.now());
            return repository.save(inventory);
        } else {
            throw new RuntimeException("Inventory record not found with id: " + id);
        }
    }
}