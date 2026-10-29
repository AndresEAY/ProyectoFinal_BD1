package com.biblioteca.service;

import com.biblioteca.config.SesionOracle;
import com.biblioteca.dto.AutorDto;
import com.biblioteca.entity.Autor;
import com.biblioteca.exception.ApiException;
import com.biblioteca.repository.AutorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AutorService {

    private final AutorRepository autorRepository;
    private final SesionOracle sesionOracle;

    @Transactional(readOnly = true)
    public List<AutorDto> listar() {
        return autorRepository.findAll(Sort.by("apellidos", "nombres")).stream().map(AutorService::aDto).toList();
    }

    @Transactional(readOnly = true)
    public AutorDto obtener(Long id) {
        return aDto(buscar(id));
    }

    @Transactional
    public AutorDto guardar(Long id, AutorDto dto) {
        Autor autor = id == null ? new Autor() : buscar(id);
        sesionOracle.fijarUsuario();
        autor.setNombres(dto.nombres());
        autor.setApellidos(dto.apellidos());
        autor.setNacionalidad(dto.nacionalidad());
        return aDto(autorRepository.saveAndFlush(autor));
    }

    @Transactional
    public void eliminar(Long id) {
        Autor autor = buscar(id);
        sesionOracle.fijarUsuario();
        autorRepository.delete(autor);
        autorRepository.flush();
    }

    private Autor buscar(Long id) {
        return autorRepository.findById(id).orElseThrow(() -> ApiException.noEncontrado("El autor no existe."));
    }

    static AutorDto aDto(Autor a) {
        return new AutorDto(a.getId(), a.getNombres(), a.getApellidos(), a.getNacionalidad());
    }
}
