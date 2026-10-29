package com.biblioteca.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record EditorialDto(Long id,
                           @NotBlank @Size(max = 150) String nombre,
                           @Size(max = 60) String pais) {
}
