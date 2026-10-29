package com.biblioteca.service;

import com.biblioteca.dto.RolDto;
import com.biblioteca.repository.RolRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RolService {

    private final RolRepository rolRepository;

    @Transactional(readOnly = true)
    public List<RolDto> listar() {
        return rolRepository.findAll(Sort.by("id")).stream()
                .map(r -> new RolDto(r.getId(), r.getNombre(), r.getDescripcion(), r.getDiasPrestamo(), r.getMaxPrestamos()))
                .toList();
    }
}
