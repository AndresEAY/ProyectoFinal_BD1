package com.biblioteca.controller;

import com.biblioteca.dto.AutorDto;
import com.biblioteca.service.AutorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/autores")
@RequiredArgsConstructor
public class AutorController {

    private final AutorService autorService;

    @GetMapping
    public List<AutorDto> listar() {
        return autorService.listar();
    }

    @GetMapping("/{id}")
    public AutorDto obtener(@PathVariable Long id) {
        return autorService.obtener(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AutorDto crear(@Valid @RequestBody AutorDto dto) {
        return autorService.guardar(null, dto);
    }

    @PutMapping("/{id}")
    public AutorDto actualizar(@PathVariable Long id, @Valid @RequestBody AutorDto dto) {
        return autorService.guardar(id, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Long id) {
        autorService.eliminar(id);
    }
}
