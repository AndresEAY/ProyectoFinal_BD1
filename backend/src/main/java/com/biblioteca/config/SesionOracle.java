package com.biblioteca.config;

import com.biblioteca.security.UsuarioActual;
import com.biblioteca.security.UsuarioAutenticado;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

@Component
@RequiredArgsConstructor
public class SesionOracle {

    private final JdbcTemplate jdbcTemplate;
    private final EntityManager entityManager;

    public void fijarUsuario() {
        UsuarioAutenticado usuario = UsuarioActual.obtener();
        String identificador = usuario == null ? "ANONIMO" : usuario.username();
        jdbcTemplate.update("BEGIN DBMS_SESSION.SET_IDENTIFIER(?); END;", identificador);
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void beforeCommit(boolean readOnly) {
                entityManager.flush();
                limpiar();
            }

            @Override
            public void beforeCompletion() {
                limpiar();
            }
        });
    }

    private void limpiar() {
        try {
            jdbcTemplate.update("BEGIN DBMS_SESSION.CLEAR_IDENTIFIER; END;");
        } catch (RuntimeException ignored) {
        }
    }
}
