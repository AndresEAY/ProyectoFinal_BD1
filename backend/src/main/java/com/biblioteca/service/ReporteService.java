package com.biblioteca.service;

import com.biblioteca.exception.ApiException;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReporteService {

    private static final Map<String, String> CONSULTAS = Map.of(
            "libros-mas-prestados", "SELECT * FROM VW_LIBROS_MAS_PRESTADOS ORDER BY TOTAL_PRESTAMOS DESC, TITULO",
            "prestamos-activos", "SELECT * FROM VW_PRESTAMOS_ACTIVOS ORDER BY FECHA_DEVOLUCION_PREVISTA",
            "prestamos-vencidos", "SELECT * FROM VW_PRESTAMOS_VENCIDOS ORDER BY DIAS_RETRASO DESC",
            "prestamos-por-mes", "SELECT * FROM VW_PRESTAMOS_POR_MES ORDER BY MES",
            "prestamos-por-usuario", "SELECT * FROM VW_PRESTAMOS_POR_USUARIO ORDER BY TOTAL_PRESTAMOS DESC, USUARIO",
            "inventario-por-categoria", "SELECT * FROM VW_INVENTARIO_POR_CATEGORIA ORDER BY CATEGORIA",
            "devoluciones-a-tiempo-vs-tarde", "SELECT * FROM VW_DEVOLUCIONES_A_TIEMPO_VS_TARDE ORDER BY RESULTADO");

    private final JdbcTemplate jdbcTemplate;

    @Transactional(readOnly = true)
    public List<Map<String, Object>> consultar(String nombre) {
        String sql = CONSULTAS.get(nombre);
        if (sql == null) {
            throw ApiException.noEncontrado("El reporte no existe.");
        }
        List<Map<String, Object>> filas = new ArrayList<>();
        for (Map<String, Object> fila : jdbcTemplate.queryForList(sql)) {
            Map<String, Object> limpia = new LinkedHashMap<>();
            fila.forEach((columna, valor) -> limpia.put(columna,
                    valor instanceof Timestamp t ? t.toLocalDateTime().toLocalDate().toString() : valor));
            filas.add(limpia);
        }
        return filas;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> resumen() {
        return jdbcTemplate.queryForMap("""
                SELECT (SELECT COUNT(*) FROM PRESTAMO WHERE ESTADO = 'ACTIVO' AND FECHA_DEVOLUCION_PREVISTA >= TRUNC(SYSDATE)) AS PRESTAMOS_ACTIVOS,
                       (SELECT COUNT(*) FROM VW_PRESTAMOS_VENCIDOS) AS PRESTAMOS_VENCIDOS,
                       (SELECT COUNT(*) FROM EJEMPLAR WHERE ESTADO = 'DISPONIBLE') AS EJEMPLARES_DISPONIBLES,
                       (SELECT COUNT(*) FROM LIBRO WHERE ESTADO = 'A') AS LIBROS_ACTIVOS,
                       (SELECT COUNT(*) FROM USUARIO WHERE ESTADO = 'A') AS USUARIOS_ACTIVOS,
                       (SELECT COUNT(*) FROM DEVOLUCION WHERE FECHA_DEVOLUCION_REAL >= TRUNC(SYSDATE) - 30) AS DEVOLUCIONES_ULTIMOS_30_DIAS
                FROM dual
                """);
    }

    public byte[] csv(String nombre) {
        List<Map<String, Object>> filas = consultar(nombre);
        StringBuilder sb = new StringBuilder("﻿");
        if (!filas.isEmpty()) {
            sb.append(String.join(",", filas.get(0).keySet())).append("\r\n");
            for (Map<String, Object> fila : filas) {
                sb.append(String.join(",", fila.values().stream().map(this::celdaCsv).toList())).append("\r\n");
            }
        }
        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }

    public byte[] xlsx(String nombre) {
        List<Map<String, Object>> filas = consultar(nombre);
        try (XSSFWorkbook libro = new XSSFWorkbook(); ByteArrayOutputStream salida = new ByteArrayOutputStream()) {
            Sheet hoja = libro.createSheet(nombre);
            if (!filas.isEmpty()) {
                List<String> columnas = new ArrayList<>(filas.get(0).keySet());
                Row encabezado = hoja.createRow(0);
                for (int c = 0; c < columnas.size(); c++) {
                    encabezado.createCell(c).setCellValue(columnas.get(c));
                }
                for (int f = 0; f < filas.size(); f++) {
                    Row fila = hoja.createRow(f + 1);
                    for (int c = 0; c < columnas.size(); c++) {
                        Object valor = filas.get(f).get(columnas.get(c));
                        if (valor instanceof Number n) {
                            fila.createCell(c).setCellValue(n.doubleValue());
                        } else if (valor != null) {
                            fila.createCell(c).setCellValue(valor.toString());
                        }
                    }
                }
                for (int c = 0; c < columnas.size(); c++) {
                    hoja.autoSizeColumn(c);
                }
            }
            libro.write(salida);
            return salida.toByteArray();
        } catch (IOException e) {
            throw new IllegalStateException("No se pudo generar el archivo Excel.", e);
        }
    }

    private String celdaCsv(Object valor) {
        if (valor == null) {
            return "";
        }
        String texto = valor.toString();
        if (texto.contains(",") || texto.contains("\"") || texto.contains("\n")) {
            return "\"" + texto.replace("\"", "\"\"") + "\"";
        }
        return texto;
    }
}
