package com.example.ProyectoWeb.config;

import io.github.cdimascio.dotenv.Dotenv;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.ArrayList;

@Service
public class JwtService {

    // Replace this with a secure key in a real application, ideally fetched from environment variables
    Dotenv dotenv = Dotenv.load();
    private static final String SECRET_KEY = "5367566B59703373367639792F423F4528482B4D6251655468576D5A71347437";

    public String getToken(UserDetails user) {
        Map<String, Object> claims = new HashMap<>();
        if (user instanceof com.example.ProyectoWeb.entity.Usuario usuario) {
            String role = usuario.getRol().name();
            claims.put("role", role.toLowerCase()); 
            claims.put("id", usuario.getId());
            
            // Añadir authorities basadas en el rol (usar original en mayúsculas)
            List<String> authorities = new ArrayList<>();
            if (role.equals("ADMIN")) {
                authorities.add("admin:read");
                authorities.add("admin:write");
                authorities.add("admin:update");
                authorities.add("admin:delete");
            } else if (role.equals("USUARIO")) {
                authorities.add("user:read");
            }
            
            System.out.println("Generando token con role: " + role);
            System.out.println("Authorities: " + authorities);
            
            claims.put("authorities", authorities);
        }
        return getToken(claims, user);
    }

    private String getToken(Map<String,Object> extractClaims, UserDetails user) {
        return Jwts
                .builder()
                .setClaims(extractClaims)
                .setSubject(user.getUsername())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 24))
                .signWith(getKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    private Key getKey() {
        byte[] keyBytes = Decoders.BASE64.decode(SECRET_KEY);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String getUsernameFromToken(String token) {
        return getClaim(token, Claims::getSubject);
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = getUsernameFromToken(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }

    private Claims getAllClaims(String token) {
        return Jwts
                .parserBuilder()
                .setSigningKey(getKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public <T> T getClaim(String token, Function<Claims,T> claimsResolver) {
        final Claims claims = getAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Date getExpirationDateFromToken(String token) {
        return getClaim(token, Claims::getExpiration);
    }

    private boolean isTokenExpired(String token) {
        return getExpirationDateFromToken(token).before(new Date());
    }

    // Agregar este método en JwtService.java
    public Claims extractAllClaims(String token) {
        return getAllClaims(token);
    }

}
