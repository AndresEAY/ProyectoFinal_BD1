package com.biblioteca.service;

import com.biblioteca.config.SesionOracle;
import com.biblioteca.dto.DevolucionDto;
import com.biblioteca.dto.DevolucionRequest;
import com.biblioteca.entity.Devolucion;
import com.biblioteca.entity.Prestamo;
import com.biblioteca.exception.ApiException;
import com.biblioteca.repository.DevolucionRepository;
import com.biblioteca.security.UsuarioActual;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.SqlOutParameter;
import org.springframework.jdbc.core.SqlParameter;
import org.springframework.jdbc.core.simple.SimpleJdbcCall;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Types;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DevolucionService {

    private final DevolucionRepository devolucionRepository;
    private final JdbcTemplate jdbcTemplate;
    private final SesionOracle sesionOracle;

    @Transactional(readOnly = true)
    public List<DevolucionDto> listar() {
        return devolucionRepository.findAll(Sort.by(Sort.Direction.DESC, "fechaDevolucionReal", "id")).stream()
                .map(this::aDto)
                .toList();
    }

    @Transactional
    public DevolucionDto registrar(DevolucionRequest request) {
        sesionOracle.fijarUsuario();
        Map<String, Object> resultado = new SimpleJdbcCall(jdbcTemplate)
                .withCatalogName("PKG_BIBLIOTECA")
                .withProcedureName("SP_REGISTRAR_DEVOLUCION")
                .withoutProcedureColumnMetaDataAccess()
                .declareParameters(
                        new SqlParameter("p_id_prestamo", Types.NUMERIC),
                        new SqlParameter("p_id_bibliotecario", Types.NUMERIC),
                        new SqlParameter("p_observaciones", Types.VARCHAR),
                        new SqlParameter("p_estado_ejemplar", Types.VARCHAR),
                        new SqlOutParameter("p_id_devolucion", Types.NUMERIC))
                .execute(request.idPrestamo(), UsuarioActual.obtener().id(), request.observaciones(),
                        request.estadoEjemplar() == null ? "DISPONIBLE" : request.estadoEjemplar());
        Long id = ((Number) resultado.get("p_id_devolucion")).longValue();
        return aDto(devolucionRepository.findById(id).orElseThrow(() -> ApiException.noEncontrado("La devolución no existe.")));
    }

    private DevolucionDto aDto(Devolucion d) {
        Prestamo p = d.getPrestamo();
        return new DevolucionDto(d.getId(), p.getId(),
                p.getUsuario().getNombres() + " " + p.getUsuario().getApellidos(),
                p.getEjemplar().getCodigoBarras(), p.getEjemplar().getLibro().getTitulo(),
                p.getFechaPrestamo(), p.getFechaDevolucionPrevista(), d.getFechaDevolucionReal(), d.getATiempo(),
                d.getDiasRetraso(), d.getObservaciones(),
                d.getBibliotecario().getNombres() + " " + d.getBibliotecario().getApellidos(),
                p.getEjemplar().getEstado());
    }
}
