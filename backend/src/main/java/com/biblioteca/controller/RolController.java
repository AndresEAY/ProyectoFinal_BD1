package com.biblioteca.controller;

import com.biblioteca.dto.RolDto;
import com.biblioteca.service.RolService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/roles")
@RequiredArgsConstructor
public class RolController {

    private final RolService rolService;

    @GetMapping
    public List<RolDto> listar() {
        return rolService.listar();
    }
}
