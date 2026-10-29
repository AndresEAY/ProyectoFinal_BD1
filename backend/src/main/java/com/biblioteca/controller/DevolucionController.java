package com.biblioteca.controller;

import com.biblioteca.dto.DevolucionDto;
import com.biblioteca.dto.DevolucionRequest;
import com.biblioteca.service.DevolucionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/devoluciones")
@RequiredArgsConstructor
public class DevolucionController {

    private final DevolucionService devolucionService;

    @GetMapping
    public List<DevolucionDto> listar() {
        return devolucionService.listar();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public DevolucionDto registrar(@Valid @RequestBody DevolucionRequest request) {
        return devolucionService.registrar(request);
    }
}
