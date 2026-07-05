package com.dynamicpricing.pricing_backend.repositories;

import com.dynamicpricing.pricing_backend.models.Product;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ProductRepository
        extends MongoRepository<Product, String> {
}