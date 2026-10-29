package com.biblioteca.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@Entity
@Table(name = "DEVOLUCION")
public class Devolucion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_DEVOLUCION")
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_PRESTAMO")
    private Prestamo prestamo;

    @Column(name = "FECHA_DEVOLUCION_REAL")
    private LocalDate fechaDevolucionReal;

    @Column(name = "A_TIEMPO", columnDefinition = "CHAR(1)")
    private String aTiempo;

    @Column(name = "DIAS_RETRASO")
    private Integer diasRetraso;

    @Column(name = "OBSERVACIONES")
    private String observaciones;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_BIBLIOTECARIO")
    private Usuario bibliotecario;
}
