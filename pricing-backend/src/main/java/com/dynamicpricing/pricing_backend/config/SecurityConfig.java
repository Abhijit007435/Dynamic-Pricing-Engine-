// package com.dynamicpricing.pricing_backend.config;

// import org.springframework.context.annotation.Bean;
// import org.springframework.context.annotation.Configuration;
// import org.springframework.security.config.annotation.web.builders.HttpSecurity;
// import org.springframework.security.web.SecurityFilterChain;

// @Configuration
// public class SecurityConfig {

//     @Bean
//     public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
//         http
//                 // Turn off CSRF protection so Postman can send POST/PUT requests
//                 .csrf(csrf -> csrf.disable())
//                 // Keep the basic password requirement active
//                 .authorizeHttpRequests(auth -> auth.anyRequest().authenticated())
//                 .httpBasic(basic -> {});

//         return http.build();
//     }
// }