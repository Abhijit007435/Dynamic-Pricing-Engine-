package com.dynamicpricing.pricing_backend.services;

import com.dynamicpricing.pricing_backend.dtos.PricingHistoryResponseDTO;
import com.dynamicpricing.pricing_backend.models.PricingHistory;
import com.dynamicpricing.pricing_backend.models.Product;
import com.dynamicpricing.pricing_backend.repositories.PricingHistoryRepository;
import com.dynamicpricing.pricing_backend.repositories.ProductRepository;

import lombok.RequiredArgsConstructor;


import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PricingHistoryService {

    
    private  final PricingHistoryRepository repository;
    private final ProductRepository productRepository;

    public PricingHistory saveHistory(PricingHistory history) {
        history.setCreatedAt(LocalDateTime.now());
        return repository.save(history);
    }

    public List<PricingHistoryResponseDTO> getAllHistoryDTO() {

    return repository.findAll()
            .stream()
            .map(this::convertToDTO)
            .toList();
}
    public List<PricingHistoryResponseDTO>
getHistoryByProductIdDTO(String productId) {

    return repository
            .findByProductId(productId)
            .stream()
            .map(this::convertToDTO)
            .toList();
}
@SuppressWarnings("null")
private PricingHistoryResponseDTO
convertToDTO(PricingHistory history) {

    String productName = productRepository
            .findById(history.getProductId())
            .map(Product::getProductName)
            .orElse("Unknown Product");

    return new PricingHistoryResponseDTO(
            history.getId(),
            history.getProductId(),
            productName,
            history.getOldPrice(),
            history.getRecommendedPrice(),
            history.getReason(),
            history.getCreatedAt()
    );
}
}