package com.dynamicpricing.pricing_backend.dtos;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PricingHistoryResponseDTO {

    private String id;
    private String productId;
    private String productName;
    private double oldPrice;
    private double recommendedPrice;
    private String reason;
    private String aiExplanation;
    private LocalDateTime createdAt;
}