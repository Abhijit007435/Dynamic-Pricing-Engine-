package com.dynamicpricing.pricing_backend.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class InventoryStatusDTO {

    private String productName;
    private int availableQuantity;
    private String stockStatus;
}