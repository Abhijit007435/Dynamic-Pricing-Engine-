package com.dynamicpricing.pricing_backend.controllers;

import com.dynamicpricing.pricing_backend.models.PricingHistory;
import com.dynamicpricing.pricing_backend.services.PricingEngineService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pricing-engine")
@RequiredArgsConstructor
public class PricingEngineController {

    private final PricingEngineService pricingEngineService;

    @PostMapping("/recommend/{productId}")
    public ResponseEntity<PricingHistory> generateRecommendation(
            @PathVariable @NonNull String productId) {

        return ResponseEntity.ok(
                pricingEngineService.generateRecommendation(productId));
    }
}