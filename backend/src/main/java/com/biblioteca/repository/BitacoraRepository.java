package com.biblioteca.repository;

import com.biblioteca.entity.Bitacora;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;

public interface BitacoraRepository extends JpaRepository<Bitacora, Long> {

    @Query("""
            select b from Bitacora b
            where (:tabla is null or b.tabla = :tabla)
              and (:operacion is null or b.operacion = :operacion)
              and (:usuario is null or lower(b.usuario) like lower(concat('%', :usuario, '%')))
              and b.fechaHora >= :desde
              and b.fechaHora < :hasta
            order by b.fechaHora desc, b.id desc
            """)
    Page<Bitacora> buscar(@Param("tabla") String tabla,
                          @Param("operacion") String operacion,
                          @Param("usuario") String usuario,
                          @Param("desde") LocalDateTime desde,
                          @Param("hasta") LocalDateTime hasta,
                          Pageable pageable);
}
