package com.dynamicpricing.pricing_backend.services;

import com.dynamicpricing.pricing_backend.models.CompetitorPrice;
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

    @SuppressWarnings("null")
    public CompetitorPrice createCompetitorPrice(
            CompetitorPrice competitorPrice) {

        productRepository.findById(competitorPrice.getProductId())
                .orElseThrow(() ->
                        new RuntimeException("Product not found"));

        competitorPrice.setUpdatedAt(LocalDateTime.now());

        return competitorPriceRepository.save(competitorPrice);
    }

    public List<CompetitorPrice> getAllCompetitorPrices() {
        return competitorPriceRepository.findAll();
    }

    @SuppressWarnings("null")
    public Optional<CompetitorPrice> getCompetitorPriceById(String id) {
        return competitorPriceRepository.findById(id);
    }

    public List<CompetitorPrice> getCompetitorPricesByProductId(
            String productId) {

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
                                    new RuntimeException("Product not found"));

                    existing.setProductId(
                            updatedCompetitorPrice.getProductId());

                    existing.setCompetitorName(
                            updatedCompetitorPrice.getCompetitorName());

                    existing.setCompetitorPrice(
                            updatedCompetitorPrice.getCompetitorPrice());

                    existing.setUpdatedAt(LocalDateTime.now());

                    return competitorPriceRepository.save(existing);
                })
                .orElseThrow(() ->
                        new RuntimeException("Competitor price not found"));
    }

    public void deleteCompetitorPrice(@NonNull String id) {

        competitorPriceRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Competitor price not found"));

        competitorPriceRepository.deleteById(id);
    }
}