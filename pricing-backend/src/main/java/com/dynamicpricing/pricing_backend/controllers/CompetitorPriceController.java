package com.dynamicpricing.pricing_backend.controllers;

import com.dynamicpricing.pricing_backend.dtos.PriceComparisonDTO;
import com.dynamicpricing.pricing_backend.models.CompetitorPrice;
import com.dynamicpricing.pricing_backend.services.CompetitorPriceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/competitor-prices")
@RequiredArgsConstructor
public class CompetitorPriceController {

    private final CompetitorPriceService competitorPriceService;

    @PostMapping
    public ResponseEntity<CompetitorPrice> createCompetitorPrice(
            @Valid @RequestBody CompetitorPrice competitorPrice) {

        return ResponseEntity.ok(
                competitorPriceService.createCompetitorPrice(
                        competitorPrice));
    }

    @GetMapping
    public ResponseEntity<List<CompetitorPrice>> getAllCompetitorPrices() {

        return ResponseEntity.ok(
                competitorPriceService.getAllCompetitorPrices());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CompetitorPrice> getCompetitorPriceById(
            @PathVariable String id) {

        return competitorPriceService.getCompetitorPriceById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<CompetitorPrice>>
    getCompetitorPricesByProductId(
            @PathVariable @NonNull String productId) {

        return ResponseEntity.ok(
                competitorPriceService
                        .getCompetitorPricesByProductId(productId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CompetitorPrice> updateCompetitorPrice(
            @PathVariable String id,
            @Valid @RequestBody CompetitorPrice competitorPrice) {

        return ResponseEntity.ok(
                competitorPriceService.updateCompetitorPrice(
                        id,
                        competitorPrice));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCompetitorPrice(
            @PathVariable @NonNull String id) {

        competitorPriceService.deleteCompetitorPrice(id);

        return ResponseEntity.noContent().build();
    }
    @GetMapping("/compare/{productId}")
public ResponseEntity<PriceComparisonDTO> comparePrice(
        @PathVariable @NonNull String productId) {

    return ResponseEntity.ok(
            competitorPriceService.comparePrice(productId)
    );
}
}