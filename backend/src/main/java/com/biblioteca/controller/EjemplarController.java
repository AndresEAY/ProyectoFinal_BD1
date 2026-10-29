package com.biblioteca.controller;

import com.biblioteca.dto.EjemplarDto;
import com.biblioteca.dto.EjemplarRequest;
import com.biblioteca.service.EjemplarService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ejemplares")
@RequiredArgsConstructor
public class EjemplarController {

    private final EjemplarService ejemplarService;

    @GetMapping
    public List<EjemplarDto> listar(@RequestParam(required = false) Long idLibro,
                                    @RequestParam(required = false) String estado) {
        return ejemplarService.listar(idLibro, estado);
    }

    @GetMapping("/{id}")
    public EjemplarDto obtener(@PathVariable Long id) {
        return ejemplarService.obtener(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public EjemplarDto crear(@Valid @RequestBody EjemplarRequest request) {
        return ejemplarService.guardar(null, request);
    }

    @PutMapping("/{id}")
    public EjemplarDto actualizar(@PathVariable Long id, @Valid @RequestBody EjemplarRequest request) {
        return ejemplarService.guardar(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void desactivar(@PathVariable Long id) {
        ejemplarService.desactivar(id);
    }
}
