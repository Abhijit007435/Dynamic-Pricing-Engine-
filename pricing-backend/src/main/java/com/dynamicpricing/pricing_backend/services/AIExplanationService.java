package com.dynamicpricing.pricing_backend.services;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.google.genai.Client;
import com.google.genai.types.GenerateContentResponse;

@Service
public class AIExplanationService {

    @Value("${gemini.api.key}")
    private String apiKey;

    public String generateExplanation(
            String productName,
            double currentPrice,
            double recommendedPrice,
            String demandLevel,
            int inventory,
            double competitorPrice
    ) {

        Client client = Client.builder()
                .apiKey(apiKey)
                .build();

        String prompt = String.format("""
                You are an e-commerce pricing analyst.

                Product: %s
                Current Price: %.2f
                Recommended Price: %.2f
                Demand Level: %s
                Inventory Available: %d
                Competitor Price: %.2f

                Write 1-2 short sentences explaining the recommendation.

You are explaining a price change to a customer.

- Do not mention inventory, stock levels, profit, revenue, or business goals.
- Do not mention selling products faster.
- Focus only on market demand and competitive pricing.
- Use simple, customer-friendly language.
- Keep the explanation to 1-2 short sentences.
                """,
                productName,
                currentPrice,
                recommendedPrice,
                demandLevel,
                inventory,
                competitorPrice
        );

        GenerateContentResponse response =
                client.models.generateContent(
                        "gemini-3-flash-preview",
                        prompt,
                        null
                );

        return response.text();
    }
}