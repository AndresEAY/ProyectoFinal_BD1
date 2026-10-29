package com.biblioteca.security;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private static final String ADMIN = "ADMIN";
    private static final String BIBLIOTECARIO = "BIBLIOTECARIO";
    private static final String[] CATALOGO = {
            "/api/libros/**", "/api/ejemplares/**", "/api/autores/**", "/api/editoriales/**", "/api/categorias/**"
    };

    private final JwtFilter jwtFilter;

    @Value("${app.cors.origen}")
    private String origenCors;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**", "/swagger-ui.html", "/swagger-ui/**", "/v3/api-docs/**").permitAll()
                        .requestMatchers(HttpMethod.GET, CATALOGO).authenticated()
                        .requestMatchers(CATALOGO).hasAnyRole(ADMIN, BIBLIOTECARIO)
                        .requestMatchers(HttpMethod.GET, "/api/roles/**").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/usuarios/**").hasAnyRole(ADMIN, BIBLIOTECARIO)
                        .requestMatchers(HttpMethod.POST, "/api/usuarios/**").hasAnyRole(ADMIN, BIBLIOTECARIO)
                        .requestMatchers("/api/usuarios/**").hasRole(ADMIN)
                        .requestMatchers("/api/prestamos/**", "/api/devoluciones/**").hasAnyRole(ADMIN, BIBLIOTECARIO)
                        .requestMatchers("/api/reportes/**").hasAnyRole(ADMIN, BIBLIOTECARIO)
                        .requestMatchers("/api/bitacora/**").hasRole(ADMIN)
                        .requestMatchers("/api/historial/**").authenticated()
                        .anyRequest().authenticated())
                .exceptionHandling(e -> e
                        .authenticationEntryPoint((req, res, ex) ->
                                escribirError(res, HttpStatus.UNAUTHORIZED, "NO_AUTENTICADO", "Debe iniciar sesión."))
                        .accessDeniedHandler((req, res, ex) ->
                                escribirError(res, HttpStatus.FORBIDDEN, "PROHIBIDO", "No tiene permiso para realizar esta acción.")))
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(origenCors));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        config.setExposedHeaders(List.of("Content-Disposition"));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        return source;
    }

    private void escribirError(jakarta.servlet.http.HttpServletResponse res, HttpStatus status, String codigo, String mensaje)
            throws java.io.IOException {
        res.setStatus(status.value());
        res.setContentType(MediaType.APPLICATION_JSON_VALUE);
        res.setCharacterEncoding("UTF-8");
        res.getWriter().write("{\"codigo\":\"" + codigo + "\",\"mensaje\":\"" + mensaje + "\"}");
    }
}
