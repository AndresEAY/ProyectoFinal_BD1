package com.biblioteca.dto;

import java.time.LocalDate;

public record UsuarioDto(Long id, String codigo, String nombres, String apellidos, String correo, String telefono,
                         String direccion, LocalDate fechaRegistro, String estado, Long idRol, String rol,
                         String username) {
}
