package com.dynamicpricing.pricing_backend.services;

import com.dynamicpricing.pricing_backend.dtos.PriceComparisonDTO;
import com.dynamicpricing.pricing_backend.exception.BadRequestException;
import com.dynamicpricing.pricing_backend.exception.ResourceNotFoundException;
import com.dynamicpricing.pricing_backend.models.CompetitorPrice;
import com.dynamicpricing.pricing_backend.models.Product;
import com.dynamicpricing.pricing_backend.repositories.CompetitorPriceRepository;
import com.dynamicpricing.pricing_backend.repositories.ProductRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CompetitorPriceService {

    private final CompetitorPriceRepository competitorPriceRepository;
    private final ProductRepository productRepository;
    private final PricingEngineService pricingEngineService;

    @SuppressWarnings("null")
    public CompetitorPrice createCompetitorPrice(
            CompetitorPrice competitorPrice) {

        productRepository.findById(competitorPrice.getProductId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Product not found with id: "
                                        + competitorPrice.getProductId()));

        if (competitorPrice.getCompetitorPrice() <= 0) {
            throw new BadRequestException(
                    "Competitor price must be greater than zero");
        }

        competitorPrice.setUpdatedAt(LocalDateTime.now());

        CompetitorPrice saved =
                competitorPriceRepository.save(competitorPrice);

        pricingEngineService.generateRecommendation(
                saved.getProductId());

        return saved;
    }

    public List<CompetitorPrice> getAllCompetitorPrices() {
        return competitorPriceRepository.findAll();
    }

    @SuppressWarnings("null")
    public Optional<CompetitorPrice> getCompetitorPriceById(String id) {
        return competitorPriceRepository.findById(id);
    }

    public List<CompetitorPrice> getCompetitorPricesByProductId(
            @NonNull     String productId) {

        productRepository.findById(productId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Product not found with id: "
                                        + productId));

        return competitorPriceRepository.findByProductId(productId);
    }

    @SuppressWarnings("null")
    public CompetitorPrice updateCompetitorPrice(
            String id,
            CompetitorPrice updatedCompetitorPrice) {

        return competitorPriceRepository.findById(id)
                .map(existing -> {

                    productRepository.findById(
                            updatedCompetitorPrice.getProductId())
                            .orElseThrow(() ->
                                    new ResourceNotFoundException(
                                            "Product not found with id: "
                                                    + updatedCompetitorPrice.getProductId()));

                    if (updatedCompetitorPrice.getCompetitorPrice() <= 0) {
                        throw new BadRequestException(
                                "Competitor price must be greater than zero");
                    }

                    existing.setProductId(
                            updatedCompetitorPrice.getProductId());

                    existing.setCompetitorName(
                            updatedCompetitorPrice.getCompetitorName());

                    existing.setCompetitorPrice(
                            updatedCompetitorPrice.getCompetitorPrice());

                    existing.setUpdatedAt(LocalDateTime.now());

                    CompetitorPrice updated =
                            competitorPriceRepository.save(existing);

                    pricingEngineService.generateRecommendation(
                            updated.getProductId());

                    return updated;
                })
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Competitor price not found with id: " + id));
    }

    public void deleteCompetitorPrice(@NonNull String id) {

        competitorPriceRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Competitor price not found with id: " + id));

        competitorPriceRepository.deleteById(id);
    }

    public PriceComparisonDTO comparePrice(
            @NonNull String productId) {

        Product product = productRepository.findById(productId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Product not found with id: " + productId));

        List<CompetitorPrice> competitors =
                competitorPriceRepository.findByProductId(productId);

        if (competitors.isEmpty()) {
            throw new BadRequestException(
                    "No competitor prices found for product: "
                            + productId);
        }

        @SuppressWarnings("null")
        double avgCompetitorPrice =
                competitors.stream()
                        .mapToDouble(
                                CompetitorPrice::getCompetitorPrice)
                        .average()
                        .orElseThrow();

        avgCompetitorPrice =
                Math.round(avgCompetitorPrice * 100.0) / 100.0;

        double ourPrice = product.getCurrentPrice();

        double difference =
                Math.round(
                        Math.abs(
                                ourPrice - avgCompetitorPrice)
                                * 100.0)
                        / 100.0;

        String status;

        if (ourPrice < avgCompetitorPrice) {
            status = "CHEAPER";
        } else if (ourPrice > avgCompetitorPrice) {
            status = "MORE_EXPENSIVE";
        } else {
            status = "SAME_PRICE";
        }

        return new PriceComparisonDTO(
                product.getProductName(),
                ourPrice,
                avgCompetitorPrice,
                difference,
                status
        );
    }
}