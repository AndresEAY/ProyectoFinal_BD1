package com.biblioteca.service;

import com.biblioteca.dto.BitacoraDto;
import com.biblioteca.dto.PaginaDto;
import com.biblioteca.entity.Bitacora;
import com.biblioteca.repository.BitacoraRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class BitacoraService {

    private final BitacoraRepository bitacoraRepository;

    @Transactional(readOnly = true)
    public PaginaDto<BitacoraDto> buscar(String tabla, String operacion, String usuario, LocalDate desde, LocalDate hasta,
                                         int pagina, int tamanio) {
        Page<Bitacora> resultado = bitacoraRepository.buscar(
                vacioANull(tabla), vacioANull(operacion), vacioANull(usuario),
                (desde == null ? LocalDate.of(2000, 1, 1) : desde).atStartOfDay(),
                (hasta == null ? LocalDate.now() : hasta).plusDays(1).atStartOfDay(),
                PageRequest.of(Math.max(pagina, 0), Math.min(Math.max(tamanio, 1), 100)));
        return new PaginaDto<>(resultado.getContent().stream().map(this::aDto).toList(),
                resultado.getTotalElements(), resultado.getNumber(), resultado.getSize());
    }

    private String vacioANull(String valor) {
        return valor == null || valor.isBlank() ? null : valor.trim().toUpperCase();
    }

    private BitacoraDto aDto(Bitacora b) {
        return new BitacoraDto(b.getId(), b.getFechaHora(), b.getUsuario(), b.getTabla(), b.getOperacion(),
                b.getIdRegistro(), b.getDatosAnteriores(), b.getDatosNuevos());
    }
}
