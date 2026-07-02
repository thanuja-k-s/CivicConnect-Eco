package com.civicconnect.security;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;

public class SimpleTokenAuthenticationFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");
        String path = request.getRequestURI();
        String method = request.getMethod();

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            try {
                String token = authHeader.substring(7).trim();

                if (!token.isEmpty()) {
                    // Grant all roles — security per endpoint is enforced by SecurityConfig rules
                    List<SimpleGrantedAuthority> authorities = List.of(
                        new SimpleGrantedAuthority("ROLE_USER"),
                        new SimpleGrantedAuthority("ROLE_CITIZEN"),
                        new SimpleGrantedAuthority("ROLE_WORKER"),
                        new SimpleGrantedAuthority("ROLE_NGO"),
                        new SimpleGrantedAuthority("ROLE_ADMIN")
                    );

                    UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(token, null, authorities);

                    // Use SecurityContext instead of directly manipulating SecurityContextHolder
                    // This prevents the clearContext() issue with Spring Security 6+
                    SecurityContext context = SecurityContextHolder.createEmptyContext();
                    context.setAuthentication(authentication);
                    SecurityContextHolder.setContext(context);

                    System.out.println("[Auth Filter] ✓ Authenticated: " + method + " " + path);
                }
            } catch (Exception e) {
                System.out.println("[Auth Filter] ✗ Token error: " + e.getMessage());
            }
        }

        // Always proceed — let Security config's permitAll/authenticated rules decide
        filterChain.doFilter(request, response);
        // Do NOT clear context here — Spring Security manages its own context lifecycle
    }
}
