package com.biblioteca.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AutorDto(Long id,
                       @NotBlank @Size(max = 100) String nombres,
                       @NotBlank @Size(max = 100) String apellidos,
                       @Size(max = 60) String nacionalidad) {
}
