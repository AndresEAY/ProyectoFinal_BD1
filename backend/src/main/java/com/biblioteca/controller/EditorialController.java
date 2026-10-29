package com.biblioteca.controller;

import com.biblioteca.dto.EditorialDto;
import com.biblioteca.service.EditorialService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/editoriales")
@RequiredArgsConstructor
public class EditorialController {

    private final EditorialService editorialService;

    @GetMapping
    public List<EditorialDto> listar() {
        return editorialService.listar();
    }

    @GetMapping("/{id}")
    public EditorialDto obtener(@PathVariable Long id) {
        return editorialService.obtener(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public EditorialDto crear(@Valid @RequestBody EditorialDto dto) {
        return editorialService.guardar(null, dto);
    }

    @PutMapping("/{id}")
    public EditorialDto actualizar(@PathVariable Long id, @Valid @RequestBody EditorialDto dto) {
        return editorialService.guardar(id, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Long id) {
        editorialService.eliminar(id);
    }
}
