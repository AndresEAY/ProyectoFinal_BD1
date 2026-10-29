package com.biblioteca.service;

import com.biblioteca.config.SesionOracle;
import com.biblioteca.dto.PrestamoDto;
import com.biblioteca.dto.PrestamoRequest;
import com.biblioteca.entity.Devolucion;
import com.biblioteca.entity.Prestamo;
import com.biblioteca.exception.ApiException;
import com.biblioteca.repository.PrestamoRepository;
import com.biblioteca.security.UsuarioActual;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.SqlOutParameter;
import org.springframework.jdbc.core.SqlParameter;
import org.springframework.jdbc.core.simple.SimpleJdbcCall;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Types;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PrestamoService {

    private static final List<String> ABIERTOS = List.of("ACTIVO", "VENCIDO");

    private final PrestamoRepository prestamoRepository;
    private final JdbcTemplate jdbcTemplate;
    private final SesionOracle sesionOracle;

    @Transactional
    public List<PrestamoDto> listar(boolean soloAbiertos) {
        actualizarVencidos();
        List<Prestamo> prestamos = soloAbiertos
                ? prestamoRepository.findByEstadoInOrderByFechaDevolucionPrevistaAsc(ABIERTOS)
                : prestamoRepository.findAllByOrderByFechaPrestamoDescIdDesc();
        return prestamos.stream().map(PrestamoService::aDto).toList();
    }

    @Transactional
    public List<PrestamoDto> historialPropio() {
        actualizarVencidos();
        return prestamoRepository.findByUsuarioIdOrderByFechaPrestamoDescIdDesc(UsuarioActual.obtener().id()).stream()
                .map(PrestamoService::aDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public PrestamoDto obtener(Long id) {
        return aDto(prestamoRepository.findById(id).orElseThrow(() -> ApiException.noEncontrado("El préstamo no existe.")));
    }

    @Transactional
    public PrestamoDto registrar(PrestamoRequest request) {
        sesionOracle.fijarUsuario();
        Map<String, Object> resultado = new SimpleJdbcCall(jdbcTemplate)
                .withCatalogName("PKG_BIBLIOTECA")
                .withProcedureName("SP_REGISTRAR_PRESTAMO")
                .withoutProcedureColumnMetaDataAccess()
                .declareParameters(
                        new SqlParameter("p_id_usuario", Types.NUMERIC),
                        new SqlParameter("p_id_ejemplar", Types.NUMERIC),
                        new SqlParameter("p_id_bibliotecario", Types.NUMERIC),
                        new SqlOutParameter("p_id_prestamo", Types.NUMERIC))
                .execute(request.idUsuario(), request.idEjemplar(), UsuarioActual.obtener().id());
        Long idPrestamo = ((Number) resultado.get("p_id_prestamo")).longValue();
        return obtener(idPrestamo);
    }

    private void actualizarVencidos() {
        sesionOracle.fijarUsuario();
        jdbcTemplate.update("BEGIN PKG_BIBLIOTECA.SP_ACTUALIZAR_VENCIDOS; END;");
    }

    static PrestamoDto aDto(Prestamo p) {
        Devolucion d = p.getDevolucion();
        Long diasRestantes = d == null ? ChronoUnit.DAYS.between(LocalDate.now(), p.getFechaDevolucionPrevista()) : null;
        return new PrestamoDto(p.getId(), p.getUsuario().getId(), p.getUsuario().getCodigo(),
                p.getUsuario().getNombres() + " " + p.getUsuario().getApellidos(),
                p.getEjemplar().getId(), p.getEjemplar().getCodigoBarras(), p.getEjemplar().getLibro().getId(),
                p.getEjemplar().getLibro().getTitulo(),
                p.getBibliotecario().getNombres() + " " + p.getBibliotecario().getApellidos(),
                p.getFechaPrestamo(), p.getFechaDevolucionPrevista(), p.getEstado(), diasRestantes,
                d == null ? null : d.getFechaDevolucionReal(), d == null ? null : d.getATiempo(),
                d == null ? null : d.getDiasRetraso());
    }
}
