package com.dynamicpricing.pricing_backend.services;

import com.dynamicpricing.pricing_backend.dtos.InventoryStatusDTO;
import com.dynamicpricing.pricing_backend.exception.ResourceNotFoundException;
import com.dynamicpricing.pricing_backend.models.Inventory;
import com.dynamicpricing.pricing_backend.models.Product;
import com.dynamicpricing.pricing_backend.repositories.InventoryRepository;
import com.dynamicpricing.pricing_backend.repositories.ProductRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryRepository repository;
    private final PricingEngineService pricingEngineService;
    private final ProductRepository productRepository;

    public List<Inventory> getAllInventory() {
        return repository.findAll();
    }

    public Optional<Inventory> getInventoryById(@NonNull String id) {
        return repository.findById(id);
    }

@SuppressWarnings("null")
public Inventory saveInventory(@NonNull Inventory inventory) {

    productRepository.findById(inventory.getProductId())
            .orElseThrow(() ->
                    new ResourceNotFoundException(
                            "Product not found with id: "
                                    + inventory.getProductId()));

    Optional<Inventory> existingInventory =
            repository.findByProductId(
                    inventory.getProductId());

    Inventory savedInventory;

    if (existingInventory.isPresent()) {

        Inventory existing =
                existingInventory.get();

        existing.setAvailableQuantity(
                existing.getAvailableQuantity()
                        + inventory.getAvailableQuantity());

        existing.setUpdatedAt(LocalDateTime.now());

        savedInventory = repository.save(existing);

    } else {

        inventory.setUpdatedAt(LocalDateTime.now());

        savedInventory = repository.save(inventory);
    }

    pricingEngineService.generateRecommendation(
            savedInventory.getProductId());

    return savedInventory;
}
    @SuppressWarnings("null")
    public Inventory updateInventory(
            @NonNull String id,
            Inventory updatedData) {
productRepository.findById(updatedData.getProductId())
        .orElseThrow(() ->
                new ResourceNotFoundException(
                        "Product not found with id: "
                                + updatedData.getProductId()));
        Optional<Inventory> existingInventory =
                repository.findById(id);

        if (existingInventory.isPresent()) {

            Inventory inventory =
                    existingInventory.get();

            inventory.setProductId(
                    updatedData.getProductId());

            int newQuantity =
        inventory.getAvailableQuantity()
                + updatedData.getAvailableQuantity();

inventory.setAvailableQuantity(
        Math.max(0, newQuantity));

            inventory.setUpdatedAt(
                    LocalDateTime.now());

            Inventory savedInventory =
                    repository.save(inventory);

           pricingEngineService.generateRecommendation(
        savedInventory.getProductId());
            return savedInventory;
        }

       throw new ResourceNotFoundException(
        "Inventory record not found with id: " + id);
    }

    public void deleteInventory(@NonNull String id) {
        repository.deleteById(id);
    }
    @SuppressWarnings("null")
public List<InventoryStatusDTO> getInventoryStatus() {

    return repository.findAll()
            .stream()
            .map(inventory -> {

                String productName =
                        productRepository
                                .findById(inventory.getProductId())
                                .map(Product::getProductName)
                                .orElse("Unknown Product");

                String stockStatus;

                if (inventory.getAvailableQuantity() <= 0) {
    stockStatus = "OUT_OF_STOCK";
} else if (inventory.getAvailableQuantity() < 20) {
    stockStatus = "LOW";
} else if (inventory.getAvailableQuantity() <= 100) {
    stockStatus = "MEDIUM";
} else {
    stockStatus = "HIGH";
}

                return new InventoryStatusDTO(
                        productName,
                        inventory.getAvailableQuantity(),
                        stockStatus
                );
            })
            .toList();
}
}