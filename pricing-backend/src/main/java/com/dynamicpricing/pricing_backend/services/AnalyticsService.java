package com.dynamicpricing.pricing_backend.services;

import java.util.List;

import org.springframework.stereotype.Service;

import com.dynamicpricing.pricing_backend.dtos.DashboardSummaryDTO;
import com.dynamicpricing.pricing_backend.dtos.RecommendationDTO;
import com.dynamicpricing.pricing_backend.models.Inventory;
import com.dynamicpricing.pricing_backend.models.Product;
import com.dynamicpricing.pricing_backend.repositories.InventoryRepository;
import com.dynamicpricing.pricing_backend.repositories.PricingHistoryRepository;
import com.dynamicpricing.pricing_backend.repositories.ProductRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final PricingHistoryRepository pricingHistoryRepository;

    public DashboardSummaryDTO getDashboardSummary() {

        long totalProducts = productRepository.count();

        long lowInventoryProducts =
                inventoryRepository.findAll()
                        .stream()
                        .filter(i -> i.getAvailableQuantity() < 20)
                        .count();

        long recommendationsGenerated =
                pricingHistoryRepository.count();

        @SuppressWarnings("null")
        double averagePrice =
                productRepository.findAll()
                        .stream()
                        .mapToDouble(Product::getCurrentPrice)
                        .average()
                        .orElse(0);

        return DashboardSummaryDTO.builder()
                .totalProducts(totalProducts)
                .lowInventoryProducts(lowInventoryProducts)
                .recommendationsGenerated(recommendationsGenerated)
                .averagePrice(averagePrice)
                .build();
    }
    public List<RecommendationDTO> getRecentRecommendations() {

    return pricingHistoryRepository
            .findTop10ByOrderByCreatedAtDesc()
            .stream()
            .map(history -> RecommendationDTO.builder()
                    .productId(history.getProductId())
                    .oldPrice(history.getOldPrice())
                    .recommendedPrice(history.getRecommendedPrice())
                    .reason(history.getReason())
                    .createdAt(history.getCreatedAt())
                    .build())
            .toList();
}
public List<Inventory> getLowInventoryProducts() {

    return inventoryRepository.findAll()
            .stream()
            .filter(inventory -> inventory.getAvailableQuantity() < 20)
            .toList();
}
}