package com.dynamicpricing.pricing_backend.controllers;

import com.dynamicpricing.pricing_backend.dtos.InventoryStatusDTO;
import com.dynamicpricing.pricing_backend.models.Inventory;
import com.dynamicpricing.pricing_backend.services.InventoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    @Autowired
    private InventoryService inventoryService;

    // GET /inventory
    @GetMapping
    public ResponseEntity<List<Inventory>> getAllInventory() {
        return ResponseEntity.ok(inventoryService.getAllInventory());
    }

    // GET /inventory/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Inventory> getInventoryById(
            @PathVariable @NonNull String id) {

        Optional<Inventory> inventory = inventoryService.getInventoryById(id);

        return inventory
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // POST /inventory
    @PostMapping
    public ResponseEntity<Inventory> addInventory(
            @RequestBody @NonNull Inventory inventory) {

        Inventory savedInventory = inventoryService.saveInventory(inventory);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedInventory);
    }

    // PUT /inventory/{id}
    @PutMapping("/{id}")
    public ResponseEntity<Inventory> updateInventory(
            @PathVariable @NonNull String id,
            @RequestBody Inventory updatedData) {

        try {
            Inventory updatedInventory =
                    inventoryService.updateInventory(id, updatedData);

            return ResponseEntity.ok(updatedInventory);

        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // DELETE /inventory/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteInventory(
            @PathVariable @NonNull String id) {

        Optional<Inventory> inventory =
                inventoryService.getInventoryById(id);

        if (inventory.isEmpty()) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Inventory record not found");
        }

        inventoryService.deleteInventory(id);

        return ResponseEntity.ok("Inventory record deleted successfully");
    }
    @GetMapping("/status")
public ResponseEntity<List<InventoryStatusDTO>>
getInventoryStatus() {

    return ResponseEntity.ok(
            inventoryService.getInventoryStatus()
    );
}
}