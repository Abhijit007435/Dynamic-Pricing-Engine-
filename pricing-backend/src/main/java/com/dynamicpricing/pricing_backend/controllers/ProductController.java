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
@GetMapping("/{id}")
public Product getProductById(@PathVariable @NonNull String id) {
    return productService.getProductById(id);
}
@DeleteMapping("/{id}")
public String deleteProduct(@PathVariable @NonNull String id) {
    productService.deleteProduct(id);
    return "Product deleted successfully";
}
@PutMapping("/{id}")
public Product updateProduct(
        @PathVariable @NonNull String id,
        @RequestBody Product product) {

    return productService.updateProduct(id, product);
}
}