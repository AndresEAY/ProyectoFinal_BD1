package com.biblioteca.controller;

import com.biblioteca.dto.PrestamoDto;
import com.biblioteca.dto.PrestamoRequest;
import com.biblioteca.service.PrestamoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/prestamos")
@RequiredArgsConstructor
public class PrestamoController {

    private final PrestamoService prestamoService;

    @GetMapping
    public List<PrestamoDto> listar(@RequestParam(defaultValue = "false") boolean soloAbiertos) {
        return prestamoService.listar(soloAbiertos);
    }

    @GetMapping("/{id}")
    public PrestamoDto obtener(@PathVariable Long id) {
        return prestamoService.obtener(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PrestamoDto registrar(@Valid @RequestBody PrestamoRequest request) {
        return prestamoService.registrar(request);
    }
}
