package com.civicconnect.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import com.civicconnect.security.SimpleTokenAuthenticationFilter;
import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173", "http://localhost:8080", "http://localhost:8082"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setExposedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .addFilterBefore(new SimpleTokenAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class)
            .authorizeHttpRequests(authz -> authz
                // Allow auth endpoints without any authentication
                .requestMatchers(org.springframework.http.HttpMethod.POST, "/auth/register").permitAll()
                .requestMatchers(org.springframework.http.HttpMethod.POST, "/auth/login").permitAll()
                .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll()
                // Allow other public endpoints
                .requestMatchers("/users/email/**").permitAll()
                .requestMatchers("/complaints/complaint-id/**").permitAll()
                // All authenticated endpoints - accessible with valid Bearer token
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/complaints/citizen/**").authenticated()
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/complaints/**").authenticated()
                .requestMatchers(org.springframework.http.HttpMethod.POST, "/complaints/**").authenticated()
                .requestMatchers(org.springframework.http.HttpMethod.PUT, "/complaints/**").authenticated()
                .requestMatchers(org.springframework.http.HttpMethod.DELETE, "/complaints/**").authenticated()
                // All other requests require authentication
                .anyRequest().authenticated()
            )
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint((request, response, authException) -> {
                    System.out.println("[Security] ✗ Authentication failed for: " + request.getRequestURI());
                    response.sendError(401, "Unauthorized");
                })
            )
            .httpBasic(basic -> {});

        return http.build();
    }
}



