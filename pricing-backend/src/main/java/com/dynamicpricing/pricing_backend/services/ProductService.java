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
public Product getProductById(@NonNull String id) {
    return productRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Product not found"));
}
public void deleteProduct(@NonNull String id) {
    productRepository.deleteById(id);
}
public Product updateProduct(@NonNull String id, Product updatedProduct) {

    Product existingProduct = productRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Product not found"));

    existingProduct.setProductName(updatedProduct.getProductName());
    existingProduct.setCategory(updatedProduct.getCategory());
    existingProduct.setCurrentPrice(updatedProduct.getCurrentPrice());

    return productRepository.save(existingProduct);
}

}