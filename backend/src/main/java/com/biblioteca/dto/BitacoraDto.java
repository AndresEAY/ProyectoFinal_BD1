package com.biblioteca.dto;

import java.time.LocalDateTime;

public record BitacoraDto(Long id, LocalDateTime fechaHora, String usuario, String tabla, String operacion,
                          Long idRegistro, String datosAnteriores, String datosNuevos) {
}
