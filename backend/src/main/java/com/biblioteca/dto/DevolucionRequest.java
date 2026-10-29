package com.biblioteca.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record DevolucionRequest(
        @NotNull Long idPrestamo,
        @Size(max = 500) String observaciones,
        @Pattern(regexp = "DISPONIBLE|DANADO|PERDIDO", message = "debe ser DISPONIBLE, DANADO o PERDIDO") String estadoEjemplar) {
}
