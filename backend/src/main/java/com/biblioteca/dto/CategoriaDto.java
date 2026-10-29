package com.biblioteca.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CategoriaDto(Long id,
                           @NotBlank @Size(max = 100) String nombre,
                           @Size(max = 250) String descripcion) {
}
