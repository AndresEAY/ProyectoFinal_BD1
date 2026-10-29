package com.biblioteca.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@Entity
@Table(name = "EJEMPLAR")
public class Ejemplar {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_EJEMPLAR")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_LIBRO")
    private Libro libro;

    @Column(name = "CODIGO_BARRAS")
    private String codigoBarras;

    @Column(name = "ESTADO")
    private String estado;

    @Column(name = "FECHA_ADQUISICION")
    private LocalDate fechaAdquisicion;
}
