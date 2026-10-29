package com.biblioteca.dto;

import java.time.LocalDate;

public record EjemplarDto(Long id, Long idLibro, String isbn, String titulo, String codigoBarras, String estado,
                          LocalDate fechaAdquisicion) {
}
