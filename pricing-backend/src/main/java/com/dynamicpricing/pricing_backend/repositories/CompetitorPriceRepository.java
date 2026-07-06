package com.dynamicpricing.pricing_backend.repositories;

import com.dynamicpricing.pricing_backend.models.CompetitorPrice;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface CompetitorPriceRepository
        extends MongoRepository<CompetitorPrice, String> {

    List<CompetitorPrice> findByProductId(String productId);
}