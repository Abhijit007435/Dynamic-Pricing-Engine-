package com.dynamicpricing.pricing_backend.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PricingRecommendationDTO {

    private String productId;
    private double currentPrice;
    private double recommendedPrice;
    private String reason;
}