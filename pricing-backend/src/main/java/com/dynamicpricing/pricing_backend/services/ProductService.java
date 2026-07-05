package com.dynamicpricing.pricing_backend.services;


import com.dynamicpricing.pricing_backend.models.Product;
import com.dynamicpricing.pricing_backend.repositories.ProductRepository;

import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    public Product createProduct(@NonNull Product product) {
    return productRepository.save(product);
}
public List<Product> getAllProducts() {
    return productRepository.findAll();
}

}