package com.dynamicpricing.pricing_backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // 1. Hands over CORS control to the source defined below
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // 2. Disables CSRF so your React frontend can safely send POST/PUT requests
                .csrf(csrf -> csrf.disable())

                // 3. Demands Authentication for EVERY single request
                .authorizeHttpRequests(auth -> auth.anyRequest().permitAll());

                // 4. Uses standard Basic Auth (Username & Password)
               // .httpBasic(Customizer.withDefaults());

        return http.build();
    }

    @Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();

    configuration.setAllowedOriginPatterns(List.of("*"));
    configuration.setAllowedMethods(List.of("*"));
    configuration.setAllowedHeaders(List.of("*"));
    configuration.setAllowCredentials(false);

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);

    return source;
}
}