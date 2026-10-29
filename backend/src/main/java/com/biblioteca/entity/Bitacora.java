package com.biblioteca.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "BITACORA")
public class Bitacora {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_BITACORA")
    private Long id;

    @Column(name = "FECHA_HORA")
    private LocalDateTime fechaHora;

    @Column(name = "USUARIO")
    private String usuario;

    @Column(name = "TABLA")
    private String tabla;

    @Column(name = "OPERACION")
    private String operacion;

    @Column(name = "ID_REGISTRO")
    private Long idRegistro;

    @Lob
    @Column(name = "DATOS_ANTERIORES")
    private String datosAnteriores;

    @Lob
    @Column(name = "DATOS_NUEVOS")
    private String datosNuevos;
}
