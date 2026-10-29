package com.biblioteca.repository;

import com.biblioteca.entity.Usuario;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    @EntityGraph(attributePaths = "rol")
    Optional<Usuario> findByUsername(String username);

    @EntityGraph(attributePaths = "rol")
    List<Usuario> findAllByOrderByApellidosAscNombresAsc();
}
