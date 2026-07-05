package com.dynamicpricing.pricing_backend.dtos;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ProductResponseDTO {

    private String id;
    private String productName;
    private String category;
    private Double currentPrice;
}