package com.biblioteca.service;

import com.biblioteca.config.SesionOracle;
import com.biblioteca.dto.EditorialDto;
import com.biblioteca.entity.Editorial;
import com.biblioteca.exception.ApiException;
import com.biblioteca.repository.EditorialRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EditorialService {

    private final EditorialRepository editorialRepository;
    private final SesionOracle sesionOracle;

    @Transactional(readOnly = true)
    public List<EditorialDto> listar() {
        return editorialRepository.findAll(Sort.by("nombre")).stream().map(this::aDto).toList();
    }

    @Transactional(readOnly = true)
    public EditorialDto obtener(Long id) {
        return aDto(buscar(id));
    }

    @Transactional
    public EditorialDto guardar(Long id, EditorialDto dto) {
        Editorial editorial = id == null ? new Editorial() : buscar(id);
        sesionOracle.fijarUsuario();
        editorial.setNombre(dto.nombre());
        editorial.setPais(dto.pais());
        return aDto(editorialRepository.saveAndFlush(editorial));
    }

    @Transactional
    public void eliminar(Long id) {
        Editorial editorial = buscar(id);
        sesionOracle.fijarUsuario();
        editorialRepository.delete(editorial);
        editorialRepository.flush();
    }

    private Editorial buscar(Long id) {
        return editorialRepository.findById(id).orElseThrow(() -> ApiException.noEncontrado("La editorial no existe."));
    }

    private EditorialDto aDto(Editorial e) {
        return new EditorialDto(e.getId(), e.getNombre(), e.getPais());
    }
}
