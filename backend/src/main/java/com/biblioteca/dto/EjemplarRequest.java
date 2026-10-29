package com.biblioteca.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record EjemplarRequest(
        @NotNull Long idLibro,
        @NotBlank @Size(max = 30) String codigoBarras,
        @Pattern(regexp = "DISPONIBLE|DANADO|PERDIDO|INACTIVO", message = "debe ser DISPONIBLE, DANADO, PERDIDO o INACTIVO") String estado,
        LocalDate fechaAdquisicion) {
}
