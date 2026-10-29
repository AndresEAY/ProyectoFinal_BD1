package com.biblioteca.service;

import com.biblioteca.config.SesionOracle;
import com.biblioteca.dto.LibroDto;
import com.biblioteca.dto.LibroRequest;
import com.biblioteca.entity.Autor;
import com.biblioteca.entity.Libro;
import com.biblioteca.exception.ApiException;
import com.biblioteca.repository.AutorRepository;
import com.biblioteca.repository.CategoriaRepository;
import com.biblioteca.repository.EditorialRepository;
import com.biblioteca.repository.EjemplarRepository;
import com.biblioteca.repository.LibroRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.HashSet;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LibroService {

    private final LibroRepository libroRepository;
    private final EditorialRepository editorialRepository;
    private final CategoriaRepository categoriaRepository;
    private final AutorRepository autorRepository;
    private final EjemplarRepository ejemplarRepository;
    private final JdbcTemplate jdbcTemplate;
    private final SesionOracle sesionOracle;

    @Transactional(readOnly = true)
    public List<LibroDto> listar() {
        return libroRepository.findAllByOrderByTituloAsc().stream().map(this::aDto).toList();
    }

    @Transactional(readOnly = true)
    public LibroDto obtener(Long id) {
        return aDto(buscar(id));
    }

    @Transactional
    public LibroDto guardar(Long id, LibroRequest request) {
        Libro libro = id == null ? new Libro() : buscar(id);
        List<Autor> autores = autorRepository.findAllById(request.idsAutores());
        if (autores.size() != new HashSet<>(request.idsAutores()).size()) {
            throw ApiException.solicitudInvalida("Alguno de los autores no existe.");
        }
        sesionOracle.fijarUsuario();
        libro.setIsbn(request.isbn());
        libro.setTitulo(request.titulo());
        libro.setAnioPublicacion(request.anioPublicacion());
        libro.setEdicion(request.edicion());
        libro.setIdioma(request.idioma());
        libro.setNumPaginas(request.numPaginas());
        libro.setEditorial(editorialRepository.findById(request.idEditorial())
                .orElseThrow(() -> ApiException.solicitudInvalida("La editorial no existe.")));
        libro.setCategoria(categoriaRepository.findById(request.idCategoria())
                .orElseThrow(() -> ApiException.solicitudInvalida("La categoría no existe.")));
        libro.setEstado(request.estado() != null ? request.estado() : (libro.getEstado() == null ? "A" : libro.getEstado()));
        libro.setAutores(new HashSet<>(autores));
        return aDto(libroRepository.saveAndFlush(libro));
    }

    @Transactional
    public void desactivar(Long id) {
        Libro libro = buscar(id);
        sesionOracle.fijarUsuario();
        libro.setEstado("I");
    }

    private Libro buscar(Long id) {
        return libroRepository.findById(id).orElseThrow(() -> ApiException.noEncontrado("El libro no existe."));
    }

    private LibroDto aDto(Libro l) {
        Long disponibles = jdbcTemplate.queryForObject(
                "SELECT PKG_BIBLIOTECA.FN_EJEMPLARES_DISPONIBLES(?) FROM dual", Long.class, l.getId());
        return new LibroDto(l.getId(), l.getIsbn(), l.getTitulo(), l.getAnioPublicacion(), l.getEdicion(),
                l.getIdioma(), l.getNumPaginas(), l.getEditorial().getId(), l.getEditorial().getNombre(),
                l.getCategoria().getId(), l.getCategoria().getNombre(), l.getEstado(),
                l.getAutores().stream().sorted(Comparator.comparing(Autor::getApellidos)).map(AutorService::aDto).toList(),
                ejemplarRepository.countByLibroId(l.getId()), disponibles == null ? 0 : disponibles);
    }
}
