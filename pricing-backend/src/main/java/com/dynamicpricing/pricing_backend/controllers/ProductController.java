package com.dynamicpricing.pricing_backend.controllers;

import com.dynamicpricing.pricing_backend.models.Product;
import com.dynamicpricing.pricing_backend.services.ProductService;
import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @PostMapping
    public Product createProduct(@RequestBody @NonNull Product product) {
        return productService.createProduct(product);
    }
    @GetMapping
public List<Product> getAllProducts() {
    return productService.getAllProducts();
}
}