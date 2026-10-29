package com.biblioteca.controller;

import com.biblioteca.dto.LibroDto;
import com.biblioteca.dto.LibroRequest;
import com.biblioteca.service.LibroService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/libros")
@RequiredArgsConstructor
public class LibroController {

    private final LibroService libroService;

    @GetMapping
    public List<LibroDto> listar() {
        return libroService.listar();
    }

    @GetMapping("/{id}")
    public LibroDto obtener(@PathVariable Long id) {
        return libroService.obtener(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public LibroDto crear(@Valid @RequestBody LibroRequest request) {
        return libroService.guardar(null, request);
    }

    @PutMapping("/{id}")
    public LibroDto actualizar(@PathVariable Long id, @Valid @RequestBody LibroRequest request) {
        return libroService.guardar(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void desactivar(@PathVariable Long id) {
        libroService.desactivar(id);
    }
}
