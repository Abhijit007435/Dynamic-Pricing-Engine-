package com.dynamicpricing.pricing_backend.models;


import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    private String id;

    private String productName;

    private String category;

    private Double currentPrice;

    private DemandLevel demandLevel;

    private LocalDateTime createdAt;
}