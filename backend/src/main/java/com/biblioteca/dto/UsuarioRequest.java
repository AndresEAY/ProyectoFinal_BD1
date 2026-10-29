package com.biblioteca.dto;

import jakarta.validation.constraints.*;

public record UsuarioRequest(
        @NotBlank @Size(max = 20) String codigo,
        @NotBlank @Size(max = 100) String nombres,
        @NotBlank @Size(max = 100) String apellidos,
        @NotBlank @Email @Size(max = 150) String correo,
        @Size(max = 20) String telefono,
        @Size(max = 250) String direccion,
        @Pattern(regexp = "[AI]", message = "debe ser A o I") String estado,
        @NotNull Long idRol,
        @NotBlank @Size(max = 50) String username,
        @Size(min = 6, max = 72, message = "debe tener entre 6 y 72 caracteres") String password) {
}
