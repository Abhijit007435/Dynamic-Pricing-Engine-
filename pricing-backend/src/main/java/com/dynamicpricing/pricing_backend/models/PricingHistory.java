package com.dynamicpricing.pricing_backend.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Document(collection = "pricing_history")
@NoArgsConstructor
@AllArgsConstructor
@Data
public class PricingHistory {

    @Id
    private String id;

    @NotBlank(message = "Product ID is mandatory")
    private String productId;

    private double oldPrice;

    private double recommendedPrice;
    
   @NotBlank(message = "Reason is mandatory")
    private String reason;

    private LocalDateTime createdAt = LocalDateTime.now();
    private String aiExplanation;

   

}