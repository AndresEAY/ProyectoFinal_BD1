package com.biblioteca.service;

import com.biblioteca.dto.LoginRequest;
import com.biblioteca.dto.LoginResponse;
import com.biblioteca.entity.Usuario;
import com.biblioteca.exception.ApiException;
import com.biblioteca.repository.UsuarioRepository;
import com.biblioteca.security.JwtService;
import com.biblioteca.security.UsuarioAutenticado;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        Usuario usuario = usuarioRepository.findByUsername(request.username())
                .filter(u -> passwordEncoder.matches(request.password(), u.getPasswordHash()))
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "CREDENCIALES_INVALIDAS", "Usuario o contraseña incorrectos."));
        if (!"A".equals(usuario.getEstado())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "USUARIO_INACTIVO", "El usuario está inactivo.");
        }
        String rol = usuario.getRol().getNombre();
        String token = jwtService.generar(new UsuarioAutenticado(usuario.getId(), usuario.getUsername(), rol));
        return new LoginResponse(token, usuario.getId(), usuario.getUsername(),
                usuario.getNombres() + " " + usuario.getApellidos(), rol);
    }
}
