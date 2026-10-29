package com.biblioteca.controller;

import com.biblioteca.dto.PrestamoDto;
import com.biblioteca.service.PrestamoService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/historial")
@RequiredArgsConstructor
public class HistorialController {

    private final PrestamoService prestamoService;

    @GetMapping
    public List<PrestamoDto> historial() {
        return prestamoService.historialPropio();
    }
}
