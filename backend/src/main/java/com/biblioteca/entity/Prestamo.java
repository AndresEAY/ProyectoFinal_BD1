package com.biblioteca.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@Entity
@Table(name = "PRESTAMO")
public class Prestamo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_PRESTAMO")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_USUARIO")
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_EJEMPLAR")
    private Ejemplar ejemplar;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_BIBLIOTECARIO")
    private Usuario bibliotecario;

    @Column(name = "FECHA_PRESTAMO")
    private LocalDate fechaPrestamo;

    @Column(name = "FECHA_DEVOLUCION_PREVISTA")
    private LocalDate fechaDevolucionPrevista;

    @Column(name = "ESTADO")
    private String estado;

    @OneToOne(mappedBy = "prestamo", fetch = FetchType.LAZY)
    private Devolucion devolucion;
}
