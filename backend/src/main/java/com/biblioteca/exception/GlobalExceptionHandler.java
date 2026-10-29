package com.biblioteca.exception;

import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.sql.SQLException;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ErrorResponse> api(ApiException e) {
        return ResponseEntity.status(e.getStatus()).body(new ErrorResponse(e.getCodigo(), e.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> validacion(MethodArgumentNotValidException e) {
        String mensaje = e.getBindingResult().getFieldErrors().stream()
                .map(f -> f.getField() + ": " + f.getDefaultMessage())
                .collect(Collectors.joining("; "));
        return ResponseEntity.badRequest().body(new ErrorResponse("VALIDACION", mensaje));
    }

    @ExceptionHandler({HttpMessageNotReadableException.class, MethodArgumentTypeMismatchException.class})
    public ResponseEntity<ErrorResponse> formato(Exception e) {
        return ResponseEntity.badRequest().body(new ErrorResponse("SOLICITUD_INVALIDA", "La solicitud tiene un formato inválido."));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> accesoDenegado(AccessDeniedException e) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new ErrorResponse("PROHIBIDO", "No tiene permiso para realizar esta acción."));
    }

    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<ErrorResponse> baseDeDatos(DataAccessException e) {
        SQLException sql = buscarSqlException(e);
        int codigo = sql == null ? 0 : sql.getErrorCode();
        if (codigo >= 20000 && codigo <= 20999) {
            String mensaje = sql.getMessage().split("\n")[0].replaceFirst("^ORA-\\d+:\\s*", "");
            return ResponseEntity.status(estadoNegocio(codigo)).body(new ErrorResponse("ORA-" + codigo, mensaje));
        }
        return switch (codigo) {
            case 1 -> ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new ErrorResponse("DUPLICADO", "Ya existe un registro con ese valor único (código, correo, usuario, ISBN o código de barras)."));
            case 2292 -> ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new ErrorResponse("EN_USO", "No se puede eliminar: el registro está relacionado con otros datos."));
            case 2291 -> ResponseEntity.badRequest()
                    .body(new ErrorResponse("REFERENCIA_INVALIDA", "Uno de los registros relacionados no existe."));
            case 2290, 1400, 12899 -> ResponseEntity.badRequest()
                    .body(new ErrorResponse("DATO_INVALIDO", "Uno de los valores no es válido o excede el tamaño permitido."));
            default -> ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("ERROR_BD", "Error al acceder a la base de datos."));
        };
    }

    private HttpStatus estadoNegocio(int codigo) {
        return switch (codigo) {
            case 20001, 20006, 20010 -> HttpStatus.NOT_FOUND;
            case 20003 -> HttpStatus.FORBIDDEN;
            case 20012 -> HttpStatus.BAD_REQUEST;
            default -> HttpStatus.CONFLICT;
        };
    }

    private SQLException buscarSqlException(Throwable e) {
        while (e != null) {
            if (e instanceof SQLException sql) {
                return sql;
            }
            e = e.getCause();
        }
        return null;
    }
}
