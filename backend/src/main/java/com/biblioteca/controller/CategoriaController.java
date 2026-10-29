package com.biblioteca.controller;

import com.biblioteca.dto.CategoriaDto;
import com.biblioteca.service.CategoriaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categorias")
@RequiredArgsConstructor
public class CategoriaController {

    private final CategoriaService categoriaService;

    @GetMapping
    public List<CategoriaDto> listar() {
        return categoriaService.listar();
    }

    @GetMapping("/{id}")
    public CategoriaDto obtener(@PathVariable Long id) {
        return categoriaService.obtener(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CategoriaDto crear(@Valid @RequestBody CategoriaDto dto) {
        return categoriaService.guardar(null, dto);
    }

    @PutMapping("/{id}")
    public CategoriaDto actualizar(@PathVariable Long id, @Valid @RequestBody CategoriaDto dto) {
        return categoriaService.guardar(id, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Long id) {
        categoriaService.eliminar(id);
    }
}
