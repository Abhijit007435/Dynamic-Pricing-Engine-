package com.dynamicpricing.pricing_backend.dtos;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RecommendationDTO {

    private String productId;
    private Double oldPrice;
    private Double recommendedPrice;
    private String reason;
    private LocalDateTime createdAt;
}
