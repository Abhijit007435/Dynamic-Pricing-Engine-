package com.dynamicpricing.pricing_backend.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class DashboardRecommendationDTO {

    private String productName;
    private double oldPrice;
    private double recommendedPrice;
    private String stockStatus;
}