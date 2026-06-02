package com.civicconnect.security;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextImpl;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.context.HttpRequestResponseHolder;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.ArrayList;
import java.util.List;

public class BearerTokenSecurityContextRepository implements SecurityContextRepository {

    @Override
    public SecurityContext loadContext(HttpRequestResponseHolder requestResponseHolder) {
        HttpServletRequest request = requestResponseHolder.getRequest();
        String authHeader = request.getHeader("Authorization");
        System.out.println("[BearerTokenSecurityContextRepository] Authorization header: " + (authHeader != null ? "Present" : "Missing"));
        
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7).trim();
            System.out.println("[BearerTokenSecurityContextRepository] Token found: " + token.substring(0, Math.min(10, token.length())) + "...");
            
            if (!token.isEmpty()) {
                List<SimpleGrantedAuthority> authorities = new ArrayList<>();
                authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
                authorities.add(new SimpleGrantedAuthority("ROLE_CITIZEN"));
                
                Authentication authentication = new UsernamePasswordAuthenticationToken(
                    token,        // principal
                    null,        // credentials
                    authorities  // authorities
                );
                
                SecurityContext context = new SecurityContextImpl(authentication);
                System.out.println("[BearerTokenSecurityContextRepository] Authentication created successfully");
                return context;
            }
        }
        
        return new SecurityContextImpl();
    }

    @Override
    public void saveContext(SecurityContext context, HttpServletRequest request, HttpServletResponse response) {
        // No-op: we don't need to persist the context
    }

    @Override
    public boolean containsContext(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        return authHeader != null && authHeader.startsWith("Bearer ");
    }
}
