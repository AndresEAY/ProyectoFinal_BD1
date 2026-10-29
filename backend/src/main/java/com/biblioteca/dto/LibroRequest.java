package com.biblioteca.dto;

import jakarta.validation.constraints.*;

import java.util.List;

public record LibroRequest(
        @NotBlank @Size(max = 20) String isbn,
        @NotBlank @Size(max = 250) String titulo,
        @Min(1000) @Max(2100) Integer anioPublicacion,
        @Size(max = 30) String edicion,
        @Size(max = 30) String idioma,
        @Positive Integer numPaginas,
        @NotNull Long idEditorial,
        @NotNull Long idCategoria,
        @Pattern(regexp = "[AI]", message = "debe ser A o I") String estado,
        @NotEmpty(message = "debe tener al menos un autor") List<Long> idsAutores) {
}
