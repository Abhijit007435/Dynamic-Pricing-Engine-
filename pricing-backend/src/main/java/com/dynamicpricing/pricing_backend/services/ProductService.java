package com.dynamicpricing.pricing_backend.services;

import com.dynamicpricing.pricing_backend.exception.ResourceNotFoundException;
import com.dynamicpricing.pricing_backend.models.Product;
import com.dynamicpricing.pricing_backend.repositories.CompetitorPriceRepository;
import com.dynamicpricing.pricing_backend.repositories.InventoryRepository;
import com.dynamicpricing.pricing_backend.repositories.PricingHistoryRepository;
import com.dynamicpricing.pricing_backend.repositories.ProductRepository;

import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final CompetitorPriceRepository competitorPriceRepository;
    private final PricingHistoryRepository pricingHistoryRepository;
    private final PricingEngineService pricingEngineService;

    public Product createProduct(@NonNull Product product) {

        product.setCreatedAt(LocalDateTime.now());

        return productRepository.save(product);
    }

    public List<Product> getAllProducts() {

        return productRepository.findAll();
    }

    public Product getProductById(@NonNull String id) {

        return productRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Product not found with id: " + id));
    }

    @SuppressWarnings("null")
    public Product updateProduct(
            @NonNull String id,
            Product updatedProduct) {

        Product existingProduct =
                productRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Product not found with id: " + id));

        existingProduct.setProductName(
                updatedProduct.getProductName());

        existingProduct.setCategory(
                updatedProduct.getCategory());

        existingProduct.setCurrentPrice(
                updatedProduct.getCurrentPrice());

        existingProduct.setDemandLevel(
                updatedProduct.getDemandLevel());

        Product savedProduct =
                productRepository.save(existingProduct);

        pricingEngineService.generateRecommendation(
                savedProduct.getId());

        return savedProduct;
    }

    @SuppressWarnings("null")
    public void deleteProduct(@NonNull String id) {

        Product product =
                productRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Product not found with id: " + id));

        inventoryRepository.deleteByProductId(
                product.getId());

        competitorPriceRepository.deleteByProductId(
                product.getId());

        pricingHistoryRepository.deleteByProductId(
                product.getId());

        productRepository.deleteById(
                product.getId());
    }
}