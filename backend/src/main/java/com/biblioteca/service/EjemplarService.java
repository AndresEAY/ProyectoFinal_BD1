package com.biblioteca.service;

import com.biblioteca.config.SesionOracle;
import com.biblioteca.dto.EjemplarDto;
import com.biblioteca.dto.EjemplarRequest;
import com.biblioteca.entity.Ejemplar;
import com.biblioteca.exception.ApiException;
import com.biblioteca.repository.EjemplarRepository;
import com.biblioteca.repository.LibroRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EjemplarService {

    private final EjemplarRepository ejemplarRepository;
    private final LibroRepository libroRepository;
    private final SesionOracle sesionOracle;

    @Transactional(readOnly = true)
    public List<EjemplarDto> listar(Long idLibro, String estado) {
        List<Ejemplar> ejemplares;
        if (idLibro != null) {
            ejemplares = ejemplarRepository.findByLibroIdOrderByCodigoBarrasAsc(idLibro);
        } else if (estado != null) {
            ejemplares = ejemplarRepository.findByEstadoOrderByCodigoBarrasAsc(estado);
        } else {
            ejemplares = ejemplarRepository.findAllByOrderByCodigoBarrasAsc();
        }
        return ejemplares.stream()
                .filter(e -> estado == null || estado.equals(e.getEstado()))
                .map(this::aDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public EjemplarDto obtener(Long id) {
        return aDto(buscar(id));
    }

    @Transactional
    public EjemplarDto guardar(Long id, EjemplarRequest request) {
        Ejemplar ejemplar = id == null ? new Ejemplar() : buscar(id);
        if ("PRESTADO".equals(ejemplar.getEstado()) && request.estado() != null && !"PRESTADO".equals(request.estado())) {
            throw ApiException.conflicto("El ejemplar está prestado; su estado cambia al registrar la devolución.");
        }
        sesionOracle.fijarUsuario();
        ejemplar.setLibro(libroRepository.findById(request.idLibro())
                .orElseThrow(() -> ApiException.solicitudInvalida("El libro no existe.")));
        ejemplar.setCodigoBarras(request.codigoBarras());
        if (request.estado() != null) {
            ejemplar.setEstado(request.estado());
        } else if (ejemplar.getEstado() == null) {
            ejemplar.setEstado("DISPONIBLE");
        }
        if (request.fechaAdquisicion() != null) {
            ejemplar.setFechaAdquisicion(request.fechaAdquisicion());
        } else if (ejemplar.getFechaAdquisicion() == null) {
            ejemplar.setFechaAdquisicion(LocalDate.now());
        }
        return aDto(ejemplarRepository.saveAndFlush(ejemplar));
    }

    @Transactional
    public void desactivar(Long id) {
        Ejemplar ejemplar = buscar(id);
        if ("PRESTADO".equals(ejemplar.getEstado())) {
            throw ApiException.conflicto("No se puede dar de baja un ejemplar prestado.");
        }
        sesionOracle.fijarUsuario();
        ejemplar.setEstado("INACTIVO");
    }

    private Ejemplar buscar(Long id) {
        return ejemplarRepository.findById(id).orElseThrow(() -> ApiException.noEncontrado("El ejemplar no existe."));
    }

    private EjemplarDto aDto(Ejemplar e) {
        return new EjemplarDto(e.getId(), e.getLibro().getId(), e.getLibro().getIsbn(), e.getLibro().getTitulo(),
                e.getCodigoBarras(), e.getEstado(), e.getFechaAdquisicion());
    }
}
