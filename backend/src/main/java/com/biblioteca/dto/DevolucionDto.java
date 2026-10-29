package com.biblioteca.dto;

import java.time.LocalDate;

public record DevolucionDto(Long id, Long idPrestamo, String usuario, String codigoBarras, String titulo,
                            LocalDate fechaPrestamo, LocalDate fechaDevolucionPrevista,
                            LocalDate fechaDevolucionReal, String aTiempo, Integer diasRetraso,
                            String observaciones, String bibliotecario, String estadoEjemplar) {
}
