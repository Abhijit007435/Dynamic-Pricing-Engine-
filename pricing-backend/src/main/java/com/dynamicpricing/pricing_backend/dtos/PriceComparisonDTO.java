package com.dynamicpricing.pricing_backend.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PriceComparisonDTO {

    private String productName;
    private double ourPrice;
    private double competitorPrice;
    private double difference;
    private String status;
}