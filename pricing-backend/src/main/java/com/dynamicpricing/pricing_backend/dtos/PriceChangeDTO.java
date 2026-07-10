package com.dynamicpricing.pricing_backend.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class PriceChangeDTO {

    private String productName;
    private double oldPrice;
    private double newPrice;
    private LocalDateTime changedAt;
}