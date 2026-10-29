package com.biblioteca.controller;

import com.biblioteca.dto.BitacoraDto;
import com.biblioteca.dto.PaginaDto;
import com.biblioteca.service.BitacoraService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/bitacora")
@RequiredArgsConstructor
public class BitacoraController {

    private final BitacoraService bitacoraService;

    @GetMapping
    public PaginaDto<BitacoraDto> buscar(@RequestParam(required = false) String tabla,
                                         @RequestParam(required = false) String operacion,
                                         @RequestParam(required = false) String usuario,
                                         @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
                                         @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta,
                                         @RequestParam(defaultValue = "0") int pagina,
                                         @RequestParam(defaultValue = "20") int tamanio) {
        return bitacoraService.buscar(tabla, operacion, usuario, desde, hasta, pagina, tamanio);
    }
}
