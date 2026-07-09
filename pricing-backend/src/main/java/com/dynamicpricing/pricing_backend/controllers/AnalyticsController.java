package com.dynamicpricing.pricing_backend.controllers;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dynamicpricing.pricing_backend.dtos.DashboardSummaryDTO;
import com.dynamicpricing.pricing_backend.dtos.RecommendationDTO;
import com.dynamicpricing.pricing_backend.models.Inventory;
import com.dynamicpricing.pricing_backend.services.AnalyticsService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardSummaryDTO> getDashboard() {
        return ResponseEntity.ok(
                analyticsService.getDashboardSummary()
        );
    }
    @GetMapping("/recommendations")
public ResponseEntity<List<RecommendationDTO>> getRecentRecommendations() {
    return ResponseEntity.ok(
            analyticsService.getRecentRecommendations()
    );
}
@GetMapping("/low-inventory")
public ResponseEntity<List<Inventory>> getLowInventoryProducts() {

    return ResponseEntity.ok(
            analyticsService.getLowInventoryProducts()
    );
}
}