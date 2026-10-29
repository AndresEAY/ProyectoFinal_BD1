package com.biblioteca.dto;

public record LoginResponse(String token, Long idUsuario, String username, String nombre, String rol) {
}
