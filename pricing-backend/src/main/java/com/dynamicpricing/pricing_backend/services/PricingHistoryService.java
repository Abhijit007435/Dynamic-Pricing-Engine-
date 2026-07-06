package com.dynamicpricing.pricing_backend.services;

import com.dynamicpricing.pricing_backend.models.PricingHistory;
import com.dynamicpricing.pricing_backend.repositories.PricingHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PricingHistoryService {

    @Autowired
    private PricingHistoryRepository repository;

    public PricingHistory saveHistory(PricingHistory history) {
        history.setCreatedAt(LocalDateTime.now());
        return repository.save(history);
    }

    public List<PricingHistory> getAllHistory() {
        return repository.findAll();
    }
}