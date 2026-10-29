package com.biblioteca.dto;

import java.time.LocalDate;

public record PrestamoDto(Long id, Long idUsuario, String codigoUsuario, String usuario, Long idEjemplar,
                          String codigoBarras, Long idLibro, String titulo, String bibliotecario,
                          LocalDate fechaPrestamo, LocalDate fechaDevolucionPrevista, String estado,
                          Long diasRestantes, LocalDate fechaDevolucionReal, String aTiempo, Integer diasRetraso) {
}
