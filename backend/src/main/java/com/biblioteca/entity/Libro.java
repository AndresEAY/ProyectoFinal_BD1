package com.biblioteca.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@Entity
@Table(name = "LIBRO")
public class Libro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_LIBRO")
    private Long id;

    @Column(name = "ISBN")
    private String isbn;

    @Column(name = "TITULO")
    private String titulo;

    @Column(name = "ANIO_PUBLICACION")
    private Integer anioPublicacion;

    @Column(name = "EDICION")
    private String edicion;

    @Column(name = "IDIOMA")
    private String idioma;

    @Column(name = "NUM_PAGINAS")
    private Integer numPaginas;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_EDITORIAL")
    private Editorial editorial;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_CATEGORIA")
    private Categoria categoria;

    @Column(name = "ESTADO", columnDefinition = "CHAR(1)")
    private String estado;

    @ManyToMany
    @JoinTable(name = "LIBRO_AUTOR",
            joinColumns = @JoinColumn(name = "ID_LIBRO"),
            inverseJoinColumns = @JoinColumn(name = "ID_AUTOR"))
    private Set<Autor> autores = new HashSet<>();
}
