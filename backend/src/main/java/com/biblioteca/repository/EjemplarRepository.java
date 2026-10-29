package com.biblioteca.repository;

import com.biblioteca.entity.Ejemplar;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EjemplarRepository extends JpaRepository<Ejemplar, Long> {

    @EntityGraph(attributePaths = "libro")
    List<Ejemplar> findAllByOrderByCodigoBarrasAsc();

    @EntityGraph(attributePaths = "libro")
    List<Ejemplar> findByLibroIdOrderByCodigoBarrasAsc(Long idLibro);

    @EntityGraph(attributePaths = "libro")
    List<Ejemplar> findByEstadoOrderByCodigoBarrasAsc(String estado);

    long countByLibroId(Long idLibro);
}
