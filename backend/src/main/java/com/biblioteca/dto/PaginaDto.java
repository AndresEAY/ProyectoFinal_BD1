package com.biblioteca.dto;

import java.util.List;

public record PaginaDto<T>(List<T> contenido, long total, int pagina, int tamanio) {
}
