package com.biblioteca.dto;

import java.util.List;

public record LibroDto(Long id, String isbn, String titulo, Integer anioPublicacion, String edicion, String idioma,
                       Integer numPaginas, Long idEditorial, String editorial, Long idCategoria, String categoria,
                       String estado, List<AutorDto> autores, long totalEjemplares, long disponibles) {
}
