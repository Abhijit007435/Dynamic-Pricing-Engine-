package com.dynamicpricing.pricing_backend.repositories;

import com.dynamicpricing.pricing_backend.models.CompetitorPrice;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface CompetitorPriceRepository
        extends MongoRepository<CompetitorPrice, String> {

    List<CompetitorPrice> findByProductId(String productId);
    Optional<CompetitorPrice>
findTopByProductIdOrderByCompetitorPriceAsc(String productId);
 void deleteByProductId(String productId);
}