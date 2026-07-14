package com.dynamicpricing.pricing_backend.services;

import com.dynamicpricing.pricing_backend.dtos.PriceComparisonDTO;
import com.dynamicpricing.pricing_backend.dtos.PricingRecommendationDTO;
import com.dynamicpricing.pricing_backend.exception.ResourceNotFoundException;
import com.dynamicpricing.pricing_backend.models.*;
import com.dynamicpricing.pricing_backend.repositories.*;

import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PricingEngineService {

    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final CompetitorPriceRepository competitorPriceRepository;
    private final PricingHistoryRepository pricingHistoryRepository;
    private final AIExplanationService aiExplanationService;

   public PricingHistory generateRecommendation(
        @NonNull String productId) {

    PricingRecommendationDTO dto =
            calculateRecommendation(productId);

    PricingHistory latest =
            pricingHistoryRepository
                    .findTopByProductIdOrderByCreatedAtDesc(
                            productId)
                    .orElse(null);

    if (latest != null
            && Double.compare(
                    latest.getRecommendedPrice(),
                    dto.getRecommendedPrice()) == 0
            && latest.getReason()
                    .equals(dto.getReason())) {

        return latest;
    }

    PricingHistory pricingHistory =
            new PricingHistory();

    pricingHistory.setProductId(
            productId);

    pricingHistory.setOldPrice(
            dto.getCurrentPrice());

    pricingHistory.setRecommendedPrice(
            dto.getRecommendedPrice());

    pricingHistory.setReason(
            dto.getReason());

    pricingHistory.setAiExplanation(
            dto.getAiExplanation());

    pricingHistory.setCreatedAt(
            LocalDateTime.now());

    return pricingHistoryRepository
            .save(pricingHistory);
}
    public PricingRecommendationDTO calculateRecommendation(
        @NonNull String productId) {

    Product product =
            productRepository.findById(productId)
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Product not found with id: "
                                            + productId));

    Inventory inventory =
            inventoryRepository
                    .findByProductId(productId)
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Inventory not found for product: "
                                            + productId));

    if (inventory.getAvailableQuantity() <= 0) {

        return new PricingRecommendationDTO(
                productId,
                product.getCurrentPrice(),
                product.getCurrentPrice(),
                "Product is OUT OF STOCK",
                "This product is currently unavailable."
        );
    }

    double basePrice =
            product.getBasePrice() > 0
                    ? product.getBasePrice()
                    : product.getCurrentPrice();

    double recommendedPrice = basePrice;

    StringBuilder reason =
            new StringBuilder();

    if (product.getDemandLevel() == DemandLevel.HIGH
            && inventory.getAvailableQuantity() < 20) {

        recommendedPrice *= 1.10;

        reason.append(
                "High demand and low inventory");
    }

    if (product.getDemandLevel() == DemandLevel.LOW
            && inventory.getAvailableQuantity() > 100) {

        recommendedPrice *= 0.90;

        if (!reason.isEmpty()) {
            reason.append(" + ");
        }

        reason.append(
                "Low demand and high inventory");
    }

    List<CompetitorPrice> competitors =
            competitorPriceRepository
                    .findByProductId(productId);

    if (!competitors.isEmpty()) {

        @SuppressWarnings("null")
        double averageCompetitorPrice =
                competitors.stream()
                        .mapToDouble(
                                CompetitorPrice::getCompetitorPrice)
                        .average()
                        .orElse(product.getCurrentPrice());

        if (averageCompetitorPrice < basePrice) {

            recommendedPrice *= 0.95;

            if (!reason.isEmpty()) {
                reason.append(" + ");
            }

            reason.append(
                    "Average competitor price is lower");
        }

        else if (averageCompetitorPrice > basePrice) {

            recommendedPrice *= 1.03;

            if (!reason.isEmpty()) {
                reason.append(" + ");
            }

            reason.append(
                    "Average competitor price is higher");
        }
    }

    if (reason.isEmpty()) {
        reason.append("No change");
    }

    recommendedPrice =
            Math.round(
                    recommendedPrice * 100.0)
                    / 100.0;

    @SuppressWarnings("null")
    double avgCompetitorPrice =
            competitors.stream()
                    .mapToDouble(
                            CompetitorPrice::getCompetitorPrice)
                    .average()
                    .orElse(0);

    String aiExplanation;

    if ("No change".equals(reason.toString())) {

        aiExplanation =
                "This product is already priced appropriately based on current market conditions.";
    }
    else {

        aiExplanation =
                aiExplanationService.generateExplanation(
                        product.getProductName(),
                        product.getCurrentPrice(),
                        recommendedPrice,
                       product.getDemandLevel() != null
        ? product.getDemandLevel().name()
        : "MEDIUM",
                        inventory.getAvailableQuantity(),
                        avgCompetitorPrice
                );
    }

    return new PricingRecommendationDTO(
            productId,
            product.getCurrentPrice(),
            recommendedPrice,
            reason.toString(),
            aiExplanation
    );
}
    
    public PriceComparisonDTO getPriceComparison(@NonNull     String productId) {

    Product product = productRepository.findById(productId)
            .orElseThrow(() ->
                    new ResourceNotFoundException("Product not found"));

    CompetitorPrice competitorPrice = competitorPriceRepository
            .findTopByProductIdOrderByUpdatedAtDesc(productId)
            .orElseThrow(() ->
                    new ResourceNotFoundException("Competitor price not found"));

    double difference =
            product.getCurrentPrice() - competitorPrice.getCompetitorPrice();

    String status;

    if (difference > 0) {
        status = "MORE_EXPENSIVE";
    } else if (difference < 0) {
        status = "CHEAPER";
    } else {
        status = "SAME_PRICE";
    }

    return new PriceComparisonDTO(
            product.getProductName(),
            product.getCurrentPrice(),
            competitorPrice.getCompetitorPrice(),
            Math.abs(difference),
            status
    );
}
}