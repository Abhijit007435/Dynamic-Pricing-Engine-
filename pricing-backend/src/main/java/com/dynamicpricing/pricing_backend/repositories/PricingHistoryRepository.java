package com.dynamicpricing.pricing_backend.repositories;

import com.dynamicpricing.pricing_backend.models.PricingHistory;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PricingHistoryRepository
        extends MongoRepository<PricingHistory, String> {
            List<PricingHistory> findByProductId(String productId);
}