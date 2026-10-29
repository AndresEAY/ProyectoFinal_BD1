package com.biblioteca.repository;

import com.biblioteca.entity.Devolucion;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DevolucionRepository extends JpaRepository<Devolucion, Long> {
}
