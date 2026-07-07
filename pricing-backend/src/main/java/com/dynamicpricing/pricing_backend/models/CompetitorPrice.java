package com.dynamicpricing.pricing_backend.models;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "competitor_prices")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CompetitorPrice {

    @Id
    private String id;

    @NotBlank(message = "Product ID is required")
    private String productId;

    @NotBlank(message = "Competitor name is required")
    private String competitorName;

    @Positive(message = "Competitor price must be greater than 0")
    private Double competitorPrice;

    private LocalDateTime updatedAt = LocalDateTime.now();

    

    
}