package com.biblioteca.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {

    private final SecretKey clave;
    private final long expiracionMinutos;

    public JwtService(@Value("${app.jwt.secret}") String secreto,
                      @Value("${app.jwt.expiracion-minutos}") long expiracionMinutos) {
        this.clave = Keys.hmacShaKeyFor(secreto.getBytes(StandardCharsets.UTF_8));
        this.expiracionMinutos = expiracionMinutos;
    }

    public String generar(UsuarioAutenticado usuario) {
        Date ahora = new Date();
        return Jwts.builder()
                .subject(usuario.username())
                .claim("id", usuario.id())
                .claim("rol", usuario.rol())
                .issuedAt(ahora)
                .expiration(new Date(ahora.getTime() + expiracionMinutos * 60_000))
                .signWith(clave)
                .compact();
    }

    public UsuarioAutenticado validar(String token) {
        try {
            Claims claims = Jwts.parser().verifyWith(clave).build().parseSignedClaims(token).getPayload();
            return new UsuarioAutenticado(claims.get("id", Long.class), claims.getSubject(), claims.get("rol", String.class));
        } catch (JwtException | IllegalArgumentException e) {
            return null;
        }
    }
}
