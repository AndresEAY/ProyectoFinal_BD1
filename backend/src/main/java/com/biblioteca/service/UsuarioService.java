package com.biblioteca.service;

import com.biblioteca.config.SesionOracle;
import com.biblioteca.dto.UsuarioDto;
import com.biblioteca.dto.UsuarioRequest;
import com.biblioteca.entity.Rol;
import com.biblioteca.entity.Usuario;
import com.biblioteca.exception.ApiException;
import com.biblioteca.repository.RolRepository;
import com.biblioteca.repository.UsuarioRepository;
import com.biblioteca.security.UsuarioActual;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private static final Set<String> ROLES_QUE_PUEDE_CREAR_BIBLIOTECARIO = Set.of("PROFESOR", "ESTUDIANTE");

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final PasswordEncoder passwordEncoder;
    private final SesionOracle sesionOracle;

    @Transactional(readOnly = true)
    public List<UsuarioDto> listar() {
        return usuarioRepository.findAllByOrderByApellidosAscNombresAsc().stream().map(this::aDto).toList();
    }

    @Transactional(readOnly = true)
    public UsuarioDto obtener(Long id) {
        return aDto(buscar(id));
    }

    @Transactional
    public UsuarioDto crear(UsuarioRequest request) {
        if (request.password() == null || request.password().isBlank()) {
            throw ApiException.solicitudInvalida("La contraseña es obligatoria al registrar un usuario.");
        }
        Rol rol = buscarRol(request.idRol());
        if ("BIBLIOTECARIO".equals(UsuarioActual.obtener().rol()) && !ROLES_QUE_PUEDE_CREAR_BIBLIOTECARIO.contains(rol.getNombre())) {
            throw ApiException.prohibido("El personal de biblioteca solo puede registrar profesores y estudiantes.");
        }
        sesionOracle.fijarUsuario();
        Usuario usuario = new Usuario();
        copiar(request, usuario, rol);
        usuario.setEstado(request.estado() == null ? "A" : request.estado());
        usuario.setPasswordHash(passwordEncoder.encode(request.password()));
        return aDto(usuarioRepository.saveAndFlush(usuario));
    }

    @Transactional
    public UsuarioDto actualizar(Long id, UsuarioRequest request) {
        Usuario usuario = buscar(id);
        sesionOracle.fijarUsuario();
        copiar(request, usuario, buscarRol(request.idRol()));
        if (request.estado() != null) {
            usuario.setEstado(request.estado());
        }
        if (request.password() != null && !request.password().isBlank()) {
            usuario.setPasswordHash(passwordEncoder.encode(request.password()));
        }
        return aDto(usuarioRepository.saveAndFlush(usuario));
    }

    @Transactional
    public void desactivar(Long id) {
        Usuario usuario = buscar(id);
        if (usuario.getId().equals(UsuarioActual.obtener().id())) {
            throw ApiException.conflicto("No puede desactivar su propio usuario.");
        }
        sesionOracle.fijarUsuario();
        usuario.setEstado("I");
    }

    private void copiar(UsuarioRequest request, Usuario usuario, Rol rol) {
        usuario.setCodigo(request.codigo());
        usuario.setNombres(request.nombres());
        usuario.setApellidos(request.apellidos());
        usuario.setCorreo(request.correo());
        usuario.setTelefono(request.telefono());
        usuario.setDireccion(request.direccion());
        usuario.setRol(rol);
        usuario.setUsername(request.username());
    }

    private Usuario buscar(Long id) {
        return usuarioRepository.findById(id).orElseThrow(() -> ApiException.noEncontrado("El usuario no existe."));
    }

    private Rol buscarRol(Long id) {
        return rolRepository.findById(id).orElseThrow(() -> ApiException.solicitudInvalida("El rol no existe."));
    }

    private UsuarioDto aDto(Usuario u) {
        return new UsuarioDto(u.getId(), u.getCodigo(), u.getNombres(), u.getApellidos(), u.getCorreo(),
                u.getTelefono(), u.getDireccion(), u.getFechaRegistro(), u.getEstado(), u.getRol().getId(),
                u.getRol().getNombre(), u.getUsername());
    }
}
