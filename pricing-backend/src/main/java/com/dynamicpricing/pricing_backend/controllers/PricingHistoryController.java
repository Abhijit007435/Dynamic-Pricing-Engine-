package com.dynamicpricing.pricing_backend.controllers;

import com.dynamicpricing.pricing_backend.models.PricingHistory;
import com.dynamicpricing.pricing_backend.services.PricingHistoryService;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/pricing-history")
public class PricingHistoryController {

    @Autowired
    private PricingHistoryService pricingHistoryService;

    @PostMapping
    public ResponseEntity<PricingHistory> addHistory(
           @Valid @RequestBody PricingHistory history) {

        PricingHistory saved =
                pricingHistoryService.saveHistory(history);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(saved);
    }

    @GetMapping
    public ResponseEntity<List<PricingHistory>> getAllHistory() {
        return ResponseEntity.ok(
                pricingHistoryService.getAllHistory()
        );
    }
}