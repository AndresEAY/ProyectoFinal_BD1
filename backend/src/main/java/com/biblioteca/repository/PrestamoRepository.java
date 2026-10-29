package com.biblioteca.repository;

import com.biblioteca.entity.Prestamo;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface PrestamoRepository extends JpaRepository<Prestamo, Long> {

    @EntityGraph(attributePaths = {"usuario", "ejemplar", "ejemplar.libro", "bibliotecario", "devolucion"})
    List<Prestamo> findAllByOrderByFechaPrestamoDescIdDesc();

    @EntityGraph(attributePaths = {"usuario", "ejemplar", "ejemplar.libro", "bibliotecario", "devolucion"})
    List<Prestamo> findByEstadoInOrderByFechaDevolucionPrevistaAsc(Collection<String> estados);

    @EntityGraph(attributePaths = {"usuario", "ejemplar", "ejemplar.libro", "bibliotecario", "devolucion"})
    List<Prestamo> findByUsuarioIdOrderByFechaPrestamoDescIdDesc(Long idUsuario);
}
