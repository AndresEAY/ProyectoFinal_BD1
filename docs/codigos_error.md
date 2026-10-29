# Códigos de error de negocio (`PKG_BIBLIOTECA`)

Se lanzan con `RAISE_APPLICATION_ERROR`. El backend los traduce a HTTP con cuerpo `{codigo, mensaje}`.

| Código | Regla | Mensaje | HTTP sugerido |
|--------|-------|---------|---------------|
| ORA-20001 | — | El usuario solicitante no existe. | 404 |
| ORA-20002 | RN6 | El usuario está inactivo y no puede solicitar préstamos. | 409 |
| ORA-20003 | — | El usuario que registra la operación no es personal de biblioteca activo. | 403 |
| ORA-20004 | RN5 | El usuario tiene préstamos vencidos; debe devolverlos antes de solicitar otro. | 409 |
| ORA-20005 | RN4 | El usuario alcanzó el máximo de N préstamos activos permitidos para su rol. | 409 |
| ORA-20006 | — | El ejemplar no existe. | 404 |
| ORA-20007 | RN1 | El ejemplar no está disponible (estado actual: X). | 409 |
| ORA-20008 | RN10 | El libro de este ejemplar está inactivo. | 409 |
| ORA-20010 | — | El préstamo no existe. | 404 |
| ORA-20011 | RN8 | El préstamo ya fue devuelto. | 409 |
| ORA-20012 | RN2 | Estado del ejemplar inválido para una devolución: use DISPONIBLE, DANADO o PERDIDO. | 400 |
