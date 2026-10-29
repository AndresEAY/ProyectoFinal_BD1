package com.biblioteca.repository;

import com.biblioteca.entity.Libro;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LibroRepository extends JpaRepository<Libro, Long> {

    @EntityGraph(attributePaths = {"editorial", "categoria", "autores"})
    List<Libro> findAllByOrderByTituloAsc();
}
