package com.biblioteca.controller;

import com.biblioteca.exception.ApiException;
import com.biblioteca.service.ReporteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reportes")
@RequiredArgsConstructor
public class ReporteController {

    private final ReporteService reporteService;

    @GetMapping("/resumen")
    public Map<String, Object> resumen() {
        return reporteService.resumen();
    }

    @GetMapping("/{nombre}")
    public List<Map<String, Object>> consultar(@PathVariable String nombre) {
        return reporteService.consultar(nombre);
    }

    @GetMapping("/{nombre}/export")
    public ResponseEntity<byte[]> exportar(@PathVariable String nombre, @RequestParam(defaultValue = "csv") String formato) {
        return switch (formato) {
            case "csv" -> archivo(reporteService.csv(nombre), nombre + ".csv", "text/csv;charset=UTF-8");
            case "xlsx" -> archivo(reporteService.xlsx(nombre), nombre + ".xlsx",
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            default -> throw ApiException.solicitudInvalida("Formato no soportado: use csv o xlsx.");
        };
    }

    private ResponseEntity<byte[]> archivo(byte[] contenido, String nombreArchivo, String tipo) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + nombreArchivo + "\"")
                .contentType(MediaType.parseMediaType(tipo))
                .body(contenido);
    }
}
