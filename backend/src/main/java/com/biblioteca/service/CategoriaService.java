package com.biblioteca.service;

import com.biblioteca.config.SesionOracle;
import com.biblioteca.dto.CategoriaDto;
import com.biblioteca.entity.Categoria;
import com.biblioteca.exception.ApiException;
import com.biblioteca.repository.CategoriaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;
    private final SesionOracle sesionOracle;

    @Transactional(readOnly = true)
    public List<CategoriaDto> listar() {
        return categoriaRepository.findAll(Sort.by("nombre")).stream().map(this::aDto).toList();
    }

    @Transactional(readOnly = true)
    public CategoriaDto obtener(Long id) {
        return aDto(buscar(id));
    }

    @Transactional
    public CategoriaDto guardar(Long id, CategoriaDto dto) {
        Categoria categoria = id == null ? new Categoria() : buscar(id);
        sesionOracle.fijarUsuario();
        categoria.setNombre(dto.nombre());
        categoria.setDescripcion(dto.descripcion());
        return aDto(categoriaRepository.saveAndFlush(categoria));
    }

    @Transactional
    public void eliminar(Long id) {
        Categoria categoria = buscar(id);
        sesionOracle.fijarUsuario();
        categoriaRepository.delete(categoria);
        categoriaRepository.flush();
    }

    private Categoria buscar(Long id) {
        return categoriaRepository.findById(id).orElseThrow(() -> ApiException.noEncontrado("La categoría no existe."));
    }

    private CategoriaDto aDto(Categoria c) {
        return new CategoriaDto(c.getId(), c.getNombre(), c.getDescripcion());
    }
}
