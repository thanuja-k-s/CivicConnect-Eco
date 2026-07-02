package com.civicconnect.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import com.civicconnect.security.SimpleTokenAuthenticationFilter;
import java.util.Arrays;
import java.util.List;

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
        configuration.setAllowedOrigins(Arrays.asList(
            "http://localhost:5173",
            "http://localhost:8080",
            "http://localhost:8082"
        ));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setExposedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    /**
     * Build an AntPathRequestMatcher WITHOUT the /api context-path prefix.
     * In Spring Boot 3.2+ / Spring Security 6.1+, authorizeHttpRequests matchers
     * are evaluated against the servlet path (i.e. the path AFTER the context-path),
     * so prepending "/api" causes every rule to miss and all requests fall through
     * to anyRequest().authenticated().
     */
    private static AntPathRequestMatcher m(String method, String pattern) {
        return new AntPathRequestMatcher(pattern,
            method == null ? null : method);
    }
    private static AntPathRequestMatcher m(String pattern) {
        return new AntPathRequestMatcher(pattern);
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .addFilterBefore(new SimpleTokenAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class)
            .authorizeHttpRequests(authz -> authz
                // CORS preflight — always allow
                .requestMatchers(m("OPTIONS", "/**")).permitAll()

                // Auth — public
                .requestMatchers(m("POST", "/auth/login")).permitAll()
                .requestMatchers(m("POST", "/auth/register")).permitAll()

                // NGO — partial public
                .requestMatchers(m("POST", "/ngo/register")).permitAll()
                .requestMatchers(m("GET",  "/ngo/active")).permitAll()

                // Events — all GETs public
                .requestMatchers(m("GET", "/events")).permitAll()
                .requestMatchers(m("GET", "/events/upcoming")).permitAll()
                .requestMatchers(m("GET", "/events/nearby")).permitAll()
                .requestMatchers(m("GET", "/events/**")).permitAll()

                // Gamification — public
                .requestMatchers(m("GET", "/gamification/leaderboard")).permitAll()
                .requestMatchers(m("GET", "/gamification/badges")).permitAll()
                .requestMatchers(m("GET", "/gamification/**")).permitAll()

                // Eco impact — public
                .requestMatchers(m("GET", "/impact/dashboard")).permitAll()
                .requestMatchers(m("GET", "/impact/**")).permitAll()

                // Misc public
                .requestMatchers(m("GET", "/users/email/**")).permitAll()
                .requestMatchers(m("GET", "/complaints/complaint-id/**")).permitAll()

                // Everything else requires a Bearer token
                .anyRequest().authenticated()
            )
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint((request, response, authException) -> {
                    System.out.println("[Security] 401 for: "
                        + request.getMethod() + " " + request.getRequestURI());
                    response.setContentType("application/json");
                    response.setStatus(401);
                    response.getWriter().write("{\"error\":\"Unauthorized — please log in\"}");
                })
            );

        return http.build();
    }
}
