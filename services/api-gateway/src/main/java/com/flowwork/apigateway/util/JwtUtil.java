package com.flowwork.apigateway.util;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;
import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtUtil {

    // Clave secreta (debe tener al menos 256 bits para el algoritmo HS256).
    // NOTA: En un entorno de producción real, esto se inyectaría mediante variables de entorno.
    public static final String SECRET = "FlowWorkSecretKeySuperSeguraParaJWT2026!";

    private SecretKey getSignKey() {
        return Keys.hmacShaKeyFor(SECRET.getBytes());
    }

    public void validateToken(final String token) {
        Jwts.parser().verifyWith(getSignKey()).build().parseSignedClaims(token);
    }

    public String generateToken(String userName, String role) {
        return Jwts.builder()
                .subject(userName)
                .claim("role", role)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 24)) // Expira en 24 horas
                .signWith(getSignKey())
                .compact();
    }
}