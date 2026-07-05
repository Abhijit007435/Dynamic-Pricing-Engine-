package com.dynamicpricing.pricing_backend.dtos;

import lombok.Data;

@Data
public class ProductRequestDTO {

    private String productName;
    private String category;
    private Double currentPrice;
}