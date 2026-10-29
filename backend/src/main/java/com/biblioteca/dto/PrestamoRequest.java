package com.biblioteca.dto;

import jakarta.validation.constraints.NotNull;

public record PrestamoRequest(@NotNull Long idUsuario, @NotNull Long idEjemplar) {
}
