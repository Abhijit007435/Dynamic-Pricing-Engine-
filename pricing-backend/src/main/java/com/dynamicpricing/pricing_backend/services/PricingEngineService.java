package com.dynamicpricing.pricing_backend.services;

import com.dynamicpricing.pricing_backend.dtos.PricingRecommendationDTO;
import com.dynamicpricing.pricing_backend.models.CompetitorPrice;
import com.dynamicpricing.pricing_backend.models.DemandLevel;
import com.dynamicpricing.pricing_backend.models.Inventory;
import com.dynamicpricing.pricing_backend.models.PricingHistory;
import com.dynamicpricing.pricing_backend.models.Product;
import com.dynamicpricing.pricing_backend.repositories.*;
import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;

import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PricingEngineService {

    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final CompetitorPriceRepository competitorPriceRepository;
    private final PricingHistoryRepository pricingHistoryRepository;
 public PricingHistory generateRecommendation(
        @NonNull String productId) {

    PricingRecommendationDTO dto =
            calculateRecommendation(productId);

    PricingHistory pricingHistory = new PricingHistory();

    pricingHistory.setProductId(productId);
    pricingHistory.setOldPrice(dto.getCurrentPrice());
    pricingHistory.setRecommendedPrice(
            dto.getRecommendedPrice());

    pricingHistory.setReason(dto.getReason());
    pricingHistory.setCreatedAt(LocalDateTime.now());

    return pricingHistoryRepository.save(pricingHistory);
}
public PricingRecommendationDTO calculateRecommendation(
        @NonNull String productId) {

    Product product = productRepository.findById(productId)
            .orElseThrow(() ->
                    new RuntimeException("Product not found"));

    Inventory inventory = inventoryRepository
            .findByProductId(productId)
            .orElseThrow(() ->
                    new RuntimeException("Inventory not found"));

    double recommendedPrice = product.getCurrentPrice();
    String reason = "No change";

    if (product.getDemandLevel() == DemandLevel.HIGH
            && inventory.getAvailableQuantity() < 20) {

        recommendedPrice *= 1.10;
        reason = "High demand and low inventory";
    }

    if (product.getDemandLevel() == DemandLevel.LOW
            && inventory.getAvailableQuantity() > 100) {

        recommendedPrice *= 0.90;
        reason = "Low demand and high inventory";
    }

    CompetitorPrice competitorPrice =
            competitorPriceRepository
                    .findTopByProductIdOrderByCompetitorPriceAsc(productId)
                    .orElse(null);

    if (competitorPrice != null
            && competitorPrice.getCompetitorPrice()
            < product.getCurrentPrice()) {

        recommendedPrice *= 0.95;
        reason += " + Competitor cheaper";
    }

    if (competitorPrice != null
            && competitorPrice.getCompetitorPrice()
            > product.getCurrentPrice()) {

        recommendedPrice *= 1.03;
        reason += " + Competitor expensive";
    }

    return new PricingRecommendationDTO(
            productId,
            product.getCurrentPrice(),
            Math.round(recommendedPrice * 100.0) / 100.0,
            reason
    );
}

}