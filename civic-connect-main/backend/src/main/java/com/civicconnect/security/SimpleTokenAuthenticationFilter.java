package com.civicconnect.security;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class SimpleTokenAuthenticationFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        String authHeader = request.getHeader("Authorization");
        String path = request.getRequestURI();
        String method = request.getMethod();
        
        System.out.println("[Auth Filter] " + method + " " + path);
        
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            try {
                String token = authHeader.substring(7).trim();
                
                if (!token.isEmpty()) {
                    List<SimpleGrantedAuthority> authorities = new ArrayList<>();
                    authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
                    authorities.add(new SimpleGrantedAuthority("ROLE_CITIZEN"));
                    authorities.add(new SimpleGrantedAuthority("ROLE_WORKER"));
                    
                    UsernamePasswordAuthenticationToken authentication = 
                        new UsernamePasswordAuthenticationToken(
                            token,
                            null,
                            authorities
                        );
                    
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    System.out.println("[Auth Filter] ✓ Token authenticated for: " + method + " " + path);
                }
            } catch (Exception e) {
                System.out.println("[Auth Filter] ✗ Authentication error: " + e.getMessage());
                e.printStackTrace();
            }
        } else if (!path.contains("/auth/") && !path.contains("/users/email/") && !path.contains("/complaints/complaint-id/")) {
            System.out.println("[Auth Filter] ⚠ No Bearer token for protected endpoint: " + method + " " + path);
        }
        
        try {
            filterChain.doFilter(request, response);
        } finally {
            SecurityContextHolder.clearContext();
        }
    }
}
