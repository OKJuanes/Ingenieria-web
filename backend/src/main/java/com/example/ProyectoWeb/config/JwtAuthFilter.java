package com.example.ProyectoWeb.config;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    @Autowired
    private JwtService jwtService;

    @Autowired
    @Lazy
    private UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");
        String token = null;
        String username = null;
        
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7); // Extract token
            username = jwtService.getUsernameFromToken(token); // Extract username from token
        }
        
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);
            
            if (jwtService.isTokenValid(token, userDetails)) {
                // Extraer todas las claims del token
                Claims claims = jwtService.extractAllClaims(token);
                System.out.println("JWT claims: " + claims);
                
                // Crear una colección de authorities
                Collection<GrantedAuthority> authorities = new ArrayList<>();
                
                // 1. Obtener el rol del claim y agregarlo como authority con prefijo ROLE_
                String role = claims.get("role", String.class);
                if (role != null) {
                    System.out.println("Role from token: " + role);
                    authorities.add(new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()));
                    
                    // 2. AÑADIR MANUALMENTE LAS AUTHORITIES BASADAS EN EL ROL
                    if (role.equalsIgnoreCase("admin")) {
                        authorities.add(new SimpleGrantedAuthority("admin:read"));
                        authorities.add(new SimpleGrantedAuthority("admin:write"));
                        authorities.add(new SimpleGrantedAuthority("admin:update"));
                        authorities.add(new SimpleGrantedAuthority("admin:delete"));
                    } else if (role.equalsIgnoreCase("organizador")) {
                        authorities.add(new SimpleGrantedAuthority("organizador:read"));
                        authorities.add(new SimpleGrantedAuthority("organizador:write"));
                        authorities.add(new SimpleGrantedAuthority("organizador:update"));
                        authorities.add(new SimpleGrantedAuthority("organizador:delete"));
                    }
                }
                
                // 3. ESTA ES LA PARTE CRUCIAL QUE FALTA ⬇️⬇️⬇️
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails, null, authorities);
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
                // ⬆️⬆️⬆️ ESTA PARTE ES LA QUE ESTABLECE LA AUTENTICACIÓN
                
                System.out.println("Authenticated user: " + username + " with authorities: " + 
                    authorities.stream()
                        .map(GrantedAuthority::getAuthority)
                        .collect(Collectors.joining(", ")));
            }
        }
        
        filterChain.doFilter(request, response);
    }

}
