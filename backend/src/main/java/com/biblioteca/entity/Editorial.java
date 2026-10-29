package com.biblioteca.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "EDITORIAL")
public class Editorial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_EDITORIAL")
    private Long id;

    @Column(name = "NOMBRE")
    private String nombre;

    @Column(name = "PAIS")
    private String pais;
}
