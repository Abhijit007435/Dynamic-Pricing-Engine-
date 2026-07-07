package com.dynamicpricing.pricing_backend.controllers;

import com.dynamicpricing.pricing_backend.dtos.PricingRecommendationDTO;
import com.dynamicpricing.pricing_backend.services.PricingEngineService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/pricing-engine")
@RequiredArgsConstructor
public class PricingEngineController {

    private final PricingEngineService pricingEngineService;

    @PostMapping("/calculate/{productId}")
    public ResponseEntity<PricingRecommendationDTO> calculateRecommendation(
            @PathVariable @NonNull String productId) {

        return ResponseEntity.ok(
                pricingEngineService.calculateRecommendation(productId)
        );
    }
}