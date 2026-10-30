# Scripts de base de datos

Se ejecutan en este orden desde `install_all.sql` (`scripts/db-install`). Cada ejecución reinstala todo: `00_drop_all.sql` borra primero los objetos existentes.

| Orden | Script | Qué hace |
|-------|--------|----------|
| 1 | `00_drop_all.sql` | Borra paquete, procedimiento, vistas y las 11 tablas (con sus triggers). Ignora lo que no exista |
| 2 | `01_tablas.sql` | Crea las 11 tablas con PK identity, FK, UNIQUE, NOT NULL y defaults |
| 3 | `02_constraints_indices.sql` | CHECKs (estados, fechas, coherencia de devolución) e índices en FKs y campos de búsqueda. Incluye el índice único `IX_PRESTAMO_EJEMPLAR_ACTIVO` (un solo préstamo abierto por ejemplar) |
| 4 | `03_datos_catalogos.sql` | 4 roles con sus reglas, 6 categorías, 6 editoriales y 21 autores |
| 5 | `04_datos_prueba.sql` | 12 usuarios, 21 libros, 48 ejemplares, 18 préstamos y 10 devoluciones |
| 6 | `05_bitacora_triggers.sql` | `SP_REGISTRAR_BITACORA` y triggers `TRG_<TABLA>_BITACORA` en USUARIO, LIBRO, EJEMPLAR, PRESTAMO y DEVOLUCION |
| 7 | `06_paquete_biblioteca.sql` | Paquete `PKG_BIBLIOTECA` (préstamos, devoluciones, disponibilidad, vencidos) |
| 8 | `07_vistas_reportes.sql` | 7 vistas `VW_*` para reportes |
| — | `99_pruebas.sql` | Pruebas (`scripts/db-test`). Deshace todos sus cambios con `ROLLBACK` |

Los datos de prueba se cargan **antes** de crear los triggers, por eso `BITACORA` queda vacía tras instalar. Desde ese momento, toda operación se registra.

## Reglas de préstamo por rol

| Rol | Días de préstamo | Máximo de préstamos activos |
|-----|------------------|-----------------------------|
| ADMIN | 15 | 5 |
| BIBLIOTECARIO | 15 | 5 |
| PROFESOR | 15 | 5 |
| ESTUDIANTE | 7 | 3 |

## Usuarios de prueba (contraseña de todos: `Biblio2026`)

| Username | Código | Rol | Situación para la demo |
|----------|--------|-----|------------------------|
| admin, admin2 | ADM001, ADM002 | ADMIN | |
| biblio1, biblio2 | BIB001, BIB002 | BIBLIOTECARIO | |
| profesor1 | PRO001 | PROFESOR | 1 préstamo activo |
| profesor2 | PRO002 | PROFESOR | 1 préstamo activo |
| profesor3 | PRO003 | PROFESOR | 1 préstamo vencido (RN5) |
| estudiante1 | EST001 | ESTUDIANTE | 1 préstamo activo; puede pedir más |
| estudiante2 | EST002 | ESTUDIANTE | 3 activos = límite (RN4) |
| estudiante3 | EST003 | ESTUDIANTE | 1 préstamo vencido (RN5) |
| estudiante4 | EST004 | ESTUDIANTE | Sin préstamos abiertos |
| estudiante5 | EST005 | ESTUDIANTE | **Inactivo** (RN6) |

Ejemplares especiales: `EJ-9788497592208-1` DANADO, `EJ-9786073236645-2` PERDIDO, los 2 de `9788497593793` INACTIVO (libro inactivo).

## Pruebas (`99_pruebas.sql`) y resultado esperado

Cada caso imprime `OK` o `FALLO`. Resultado esperado: **26 OK, 0 FALLO(S)**. Las pruebas asumen los datos iniciales: si se usó la aplicación antes, ejecutar primero `scripts/db-install` para dejar los datos como al inicio.

| Caso | Qué prueba | Resultado esperado |
|------|-----------|--------------------|
| P1–P3 | Préstamo válido de EST001 | Se crea; fecha prevista = hoy + 7 (RN3); ejemplar PRESTADO (RN2) |
| E1 | Ejemplar ya prestado | ORA-20007 (RN1) |
| E2 | Ejemplar dañado | ORA-20007 (RN1) |
| E3 | EST002 con 3 activos | ORA-20005 (RN4) |
| E4 | EST003 con préstamo vencido | ORA-20004 (RN5) |
| E5 | EST005 inactivo | ORA-20002 (RN6) |
| E6 | Un estudiante intenta registrar el préstamo | ORA-20003 |
| E7 | Ejemplar de libro inactivo | ORA-20008 |
| E8 | Usuario inexistente | ORA-20001 |
| E9 | INSERT directo de un segundo préstamo abierto del mismo ejemplar | ORA-00001 por `IX_PRESTAMO_EJEMPLAR_ACTIVO` |
| D1–D3 | Devolución el mismo día | A_TIEMPO = S, DIAS_RETRASO = 0, ejemplar DISPONIBLE, préstamo DEVUELTO (RN7) |
| D4 | Devolver otra vez el mismo préstamo | ORA-20011 (RN8) |
| D5–D7 | Devolución tardía del préstamo vencido de PRO003, reportado DANADO | A_TIEMPO = N, DIAS_RETRASO = hoy − prevista, ejemplar DANADO (RN7, RN2) |
| D8 | Estado de ejemplar inválido en la devolución | ORA-20012 |
| V1 | `SP_ACTUALIZAR_VENCIDOS` sobre un préstamo con fecha prevista pasada | Queda VENCIDO |
| F1–F2 | `FN_EJEMPLARES_DISPONIBLES` | 3 y 2 respectivamente |
| B1–B3 | Bitácora con `CLIENT_IDENTIFIER = 'PRUEBA_99'` | Registra INSERT de PRESTAMO, 2 de DEVOLUCION y UPDATE de EJEMPLAR con datos anteriores y nuevos (RN9) |

Los códigos de error están en `docs/codigos_error.md`.
