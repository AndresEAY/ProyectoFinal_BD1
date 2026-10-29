package com.biblioteca;

import com.biblioteca.dto.DevolucionDto;
import com.biblioteca.dto.DevolucionRequest;
import com.biblioteca.dto.LoginRequest;
import com.biblioteca.dto.PrestamoDto;
import com.biblioteca.dto.PrestamoRequest;
import com.biblioteca.entity.Usuario;
import com.biblioteca.exception.ApiException;
import com.biblioteca.repository.EjemplarRepository;
import com.biblioteca.repository.UsuarioRepository;
import com.biblioteca.security.UsuarioAutenticado;
import com.biblioteca.service.AuthService;
import com.biblioteca.service.DevolucionService;
import com.biblioteca.service.PrestamoService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataAccessException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@Transactional
class BibliotecaServiceTest {

    @Autowired
    private AuthService authService;

    @Autowired
    private PrestamoService prestamoService;

    @Autowired
    private DevolucionService devolucionService;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private EjemplarRepository ejemplarRepository;

    @BeforeEach
    void autenticarComoBibliotecario() {
        Usuario biblio = usuario("biblio1");
        var principal = new UsuarioAutenticado(biblio.getId(), biblio.getUsername(), "BIBLIOTECARIO");
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(
                principal, null, List.of(new SimpleGrantedAuthority("ROLE_BIBLIOTECARIO"))));
    }

    @AfterEach
    void limpiar() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void loginCorrectoDevuelveTokenYRol() {
        var respuesta = authService.login(new LoginRequest("admin", "Biblio2026"));
        assertThat(respuesta.token()).isNotBlank();
        assertThat(respuesta.rol()).isEqualTo("ADMIN");
    }

    @Test
    void loginIncorrectoEsRechazado() {
        assertThatThrownBy(() -> authService.login(new LoginRequest("admin", "incorrecta")))
                .isInstanceOf(ApiException.class);
    }

    @Test
    void prestamoYDevolucionATiempo() {
        PrestamoDto prestamo = prestamoService.registrar(new PrestamoRequest(usuario("estudiante4").getId(), ejemplarDisponible()));
        assertThat(prestamo.estado()).isEqualTo("ACTIVO");
        assertThat(prestamo.fechaDevolucionPrevista()).isEqualTo(prestamo.fechaPrestamo().plusDays(7));

        DevolucionDto devolucion = devolucionService.registrar(new DevolucionRequest(prestamo.id(), "Prueba", null));
        assertThat(devolucion.aTiempo()).isEqualTo("S");
        assertThat(devolucion.diasRetraso()).isZero();
        assertThat(devolucion.estadoEjemplar()).isEqualTo("DISPONIBLE");
    }

    @Test
    void usuarioInactivoNoPuedePedirPrestamo() {
        assertThatThrownBy(() -> prestamoService.registrar(new PrestamoRequest(usuario("estudiante5").getId(), ejemplarDisponible())))
                .isInstanceOf(DataAccessException.class)
                .hasMessageContaining("ORA-20002");
    }

    @Test
    void usuarioEnElLimiteNoPuedePedirPrestamo() {
        assertThatThrownBy(() -> prestamoService.registrar(new PrestamoRequest(usuario("estudiante2").getId(), ejemplarDisponible())))
                .isInstanceOf(DataAccessException.class)
                .hasMessageContaining("ORA-20005");
    }

    @Test
    void historialSoloDevuelvePrestamosPropios() {
        Usuario estudiante = usuario("estudiante2");
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(
                new UsuarioAutenticado(estudiante.getId(), estudiante.getUsername(), "ESTUDIANTE"), null,
                List.of(new SimpleGrantedAuthority("ROLE_ESTUDIANTE"))));
        assertThat(prestamoService.historialPropio())
                .isNotEmpty()
                .allMatch(p -> p.idUsuario().equals(estudiante.getId()));
    }

    private Usuario usuario(String username) {
        return usuarioRepository.findByUsername(username).orElseThrow();
    }

    private Long ejemplarDisponible() {
        return ejemplarRepository.findByEstadoOrderByCodigoBarrasAsc("DISPONIBLE").getFirst().getId();
    }
}
