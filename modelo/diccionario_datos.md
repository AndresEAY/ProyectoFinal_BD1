# Diccionario de datos — Biblioteca Universitaria

Esquema: `BIBLIOTECA` · Gestor: Oracle XE 21c / Oracle Free 23ai-26ai · 11 tablas.
Todas las PK son `NUMBER(10) GENERATED ALWAYS AS IDENTITY`. Nulo = **N** significa `NOT NULL`.

## ROL
Tipos de usuario y reglas de préstamo de cada uno.

| Columna | Tipo | Nulo | Clave | Default / Check | Descripción |
|---------|------|------|-------|-----------------|-------------|
| ID_ROL | NUMBER(10) | N | PK | identity | Identificador del rol |
| NOMBRE | VARCHAR2(30 CHAR) | N | UK | ADMIN, BIBLIOTECARIO, PROFESOR, ESTUDIANTE | Nombre del rol |
| DESCRIPCION | VARCHAR2(200 CHAR) | S | | | Descripción del rol |
| DIAS_PRESTAMO | NUMBER(3) | N | | > 0 | Días que dura un préstamo para este rol (RN3) |
| MAX_PRESTAMOS | NUMBER(2) | N | | > 0 | Máximo de préstamos activos simultáneos (RN4) |

## USUARIO
Estudiantes, profesores y personal de biblioteca (func. 1).

| Columna | Tipo | Nulo | Clave | Default / Check | Descripción |
|---------|------|------|-------|-----------------|-------------|
| ID_USUARIO | NUMBER(10) | N | PK | identity | Identificador del usuario |
| CODIGO | VARCHAR2(20 CHAR) | N | UK | | Carné o código de empleado |
| NOMBRES | VARCHAR2(100 CHAR) | N | | | Nombres |
| APELLIDOS | VARCHAR2(100 CHAR) | N | | | Apellidos |
| CORREO | VARCHAR2(150 CHAR) | N | UK | | Correo electrónico |
| TELEFONO | VARCHAR2(20 CHAR) | S | | | Teléfono |
| DIRECCION | VARCHAR2(250 CHAR) | S | | | Dirección |
| FECHA_REGISTRO | DATE | N | | CURRENT_DATE | Fecha de registro |
| ESTADO | CHAR(1) | N | | 'A'; ('A','I') | A = activo, I = inactivo (RN6, RN10) |
| ID_ROL | NUMBER(10) | N | FK → ROL | | Rol del usuario |
| USERNAME | VARCHAR2(50 CHAR) | N | UK | | Nombre de inicio de sesión |
| PASSWORD_HASH | VARCHAR2(100 CHAR) | N | | | Contraseña cifrada con BCrypt |

## AUTOR
| Columna | Tipo | Nulo | Clave | Default / Check | Descripción |
|---------|------|------|-------|-----------------|-------------|
| ID_AUTOR | NUMBER(10) | N | PK | identity | Identificador del autor |
| NOMBRES | VARCHAR2(100 CHAR) | N | | | Nombres |
| APELLIDOS | VARCHAR2(100 CHAR) | N | | | Apellidos |
| NACIONALIDAD | VARCHAR2(60 CHAR) | S | | | Nacionalidad |

## EDITORIAL
| Columna | Tipo | Nulo | Clave | Default / Check | Descripción |
|---------|------|------|-------|-----------------|-------------|
| ID_EDITORIAL | NUMBER(10) | N | PK | identity | Identificador de la editorial |
| NOMBRE | VARCHAR2(150 CHAR) | N | UK | | Nombre de la editorial |
| PAIS | VARCHAR2(60 CHAR) | S | | | País de origen |

## CATEGORIA
| Columna | Tipo | Nulo | Clave | Default / Check | Descripción |
|---------|------|------|-------|-----------------|-------------|
| ID_CATEGORIA | NUMBER(10) | N | PK | identity | Identificador de la categoría |
| NOMBRE | VARCHAR2(100 CHAR) | N | UK | | Nombre de la categoría |
| DESCRIPCION | VARCHAR2(250 CHAR) | S | | | Descripción |

## LIBRO
Obra bibliográfica (func. 2). Los totales de ejemplares se calculan desde EJEMPLAR.

| Columna | Tipo | Nulo | Clave | Default / Check | Descripción |
|---------|------|------|-------|-----------------|-------------|
| ID_LIBRO | NUMBER(10) | N | PK | identity | Identificador del libro |
| ISBN | VARCHAR2(20 CHAR) | N | UK | | ISBN |
| TITULO | VARCHAR2(250 CHAR) | N | | | Título |
| ANIO_PUBLICACION | NUMBER(4) | S | | 1000–2100 | Año de publicación |
| EDICION | VARCHAR2(30 CHAR) | S | | | Edición |
| IDIOMA | VARCHAR2(30 CHAR) | S | | | Idioma |
| NUM_PAGINAS | NUMBER(5) | S | | > 0 | Número de páginas |
| ID_EDITORIAL | NUMBER(10) | N | FK → EDITORIAL | | Editorial |
| ID_CATEGORIA | NUMBER(10) | N | FK → CATEGORIA | | Categoría |
| ESTADO | CHAR(1) | N | | 'A'; ('A','I') | A = activo, I = inactivo (RN10) |

## LIBRO_AUTOR
Relación N:M entre libros y autores.

| Columna | Tipo | Nulo | Clave | Default / Check | Descripción |
|---------|------|------|-------|-----------------|-------------|
| ID_LIBRO | NUMBER(10) | N | PK, FK → LIBRO | | Libro |
| ID_AUTOR | NUMBER(10) | N | PK, FK → AUTOR | | Autor |

## EJEMPLAR
Copia física de un libro (func. 2).

| Columna | Tipo | Nulo | Clave | Default / Check | Descripción |
|---------|------|------|-------|-----------------|-------------|
| ID_EJEMPLAR | NUMBER(10) | N | PK | identity | Identificador del ejemplar |
| ID_LIBRO | NUMBER(10) | N | FK → LIBRO | | Libro al que pertenece |
| CODIGO_BARRAS | VARCHAR2(30 CHAR) | N | UK | | Código de barras |
| ESTADO | VARCHAR2(15 CHAR) | N | | 'DISPONIBLE'; ('DISPONIBLE','PRESTADO','DANADO','PERDIDO','INACTIVO') | Estado de la copia (RN1, RN2, RN10) |
| FECHA_ADQUISICION | DATE | N | | CURRENT_DATE | Fecha de adquisición |

## PRESTAMO
Préstamo de un ejemplar a un usuario (func. 3).

| Columna | Tipo | Nulo | Clave | Default / Check | Descripción |
|---------|------|------|-------|-----------------|-------------|
| ID_PRESTAMO | NUMBER(10) | N | PK | identity | Identificador del préstamo |
| ID_USUARIO | NUMBER(10) | N | FK → USUARIO | | Usuario que solicita |
| ID_EJEMPLAR | NUMBER(10) | N | FK → EJEMPLAR | | Ejemplar prestado |
| ID_BIBLIOTECARIO | NUMBER(10) | N | FK → USUARIO | | Personal que registra el préstamo |
| FECHA_PRESTAMO | DATE | N | | CURRENT_DATE | Fecha del préstamo |
| FECHA_DEVOLUCION_PREVISTA | DATE | N | | >= FECHA_PRESTAMO | FECHA_PRESTAMO + ROL.DIAS_PRESTAMO (RN3) |
| ESTADO | VARCHAR2(10 CHAR) | N | | 'ACTIVO'; ('ACTIVO','DEVUELTO','VENCIDO') | Estado del préstamo |

Índice único `IX_PRESTAMO_EJEMPLAR_ACTIVO` sobre `CASE WHEN ESTADO IN ('ACTIVO','VENCIDO') THEN ID_EJEMPLAR END`: un ejemplar solo puede tener un préstamo abierto a la vez.

## DEVOLUCION
Devolución de un préstamo (func. 4). Relación 1:0..1 con PRESTAMO.

| Columna | Tipo | Nulo | Clave | Default / Check | Descripción |
|---------|------|------|-------|-----------------|-------------|
| ID_DEVOLUCION | NUMBER(10) | N | PK | identity | Identificador de la devolución |
| ID_PRESTAMO | NUMBER(10) | N | FK → PRESTAMO, UK | | Préstamo devuelto (RN8) |
| FECHA_DEVOLUCION_REAL | DATE | N | | CURRENT_DATE | Fecha real de devolución |
| A_TIEMPO | CHAR(1) | N | | ('S','N') | S si se devolvió dentro del plazo (RN7) |
| DIAS_RETRASO | NUMBER(4) | N | | 0; >= 0 | Días de retraso (RN7) |
| OBSERVACIONES | VARCHAR2(500 CHAR) | S | | | Observaciones del estado del ejemplar |
| ID_BIBLIOTECARIO | NUMBER(10) | N | FK → USUARIO | | Personal que recibe la devolución |

## BITACORA
Registro de operaciones sobre tablas críticas (func. 7, RN9). Sin FK: debe conservar registros aunque el origen se elimine.

| Columna | Tipo | Nulo | Clave | Default / Check | Descripción |
|---------|------|------|-------|-----------------|-------------|
| ID_BITACORA | NUMBER(10) | N | PK | identity | Identificador del registro |
| FECHA_HORA | TIMESTAMP | N | | LOCALTIMESTAMP | Momento de la operación |
| USUARIO | VARCHAR2(128 CHAR) | N | | | Usuario de la aplicación (CLIENT_IDENTIFIER) o de la sesión |
| TABLA | VARCHAR2(30 CHAR) | N | | | Tabla afectada |
| OPERACION | VARCHAR2(6 CHAR) | N | | ('INSERT','UPDATE','DELETE') | Tipo de operación |
| ID_REGISTRO | NUMBER(10) | S | | | PK del registro afectado |
| DATOS_ANTERIORES | CLOB | S | | | Valores antes del cambio (JSON) |
| DATOS_NUEVOS | CLOB | S | | | Valores después del cambio (JSON) |

## Relaciones

| Relación | Cardinalidad | FK |
|----------|-------------|----|
| ROL — USUARIO | 1:N | USUARIO.ID_ROL |
| EDITORIAL — LIBRO | 1:N | LIBRO.ID_EDITORIAL |
| CATEGORIA — LIBRO | 1:N | LIBRO.ID_CATEGORIA |
| LIBRO — AUTOR | N:M | LIBRO_AUTOR.ID_LIBRO, LIBRO_AUTOR.ID_AUTOR |
| LIBRO — EJEMPLAR | 1:N | EJEMPLAR.ID_LIBRO |
| USUARIO — PRESTAMO (solicitante) | 1:N | PRESTAMO.ID_USUARIO |
| USUARIO — PRESTAMO (bibliotecario) | 1:N | PRESTAMO.ID_BIBLIOTECARIO |
| EJEMPLAR — PRESTAMO | 1:N (un solo préstamo abierto por ejemplar) | PRESTAMO.ID_EJEMPLAR |
| PRESTAMO — DEVOLUCION | 1:0..1 | DEVOLUCION.ID_PRESTAMO (UK) |
| USUARIO — DEVOLUCION (bibliotecario) | 1:N | DEVOLUCION.ID_BIBLIOTECARIO |

## Normalización (3FN)

**1FN.** Todas las columnas son atómicas y no hay grupos repetidos: los autores de un libro, que son multivaluados, se separan en `LIBRO_AUTOR`, y cada copia física es una fila de `EJEMPLAR` en lugar de un contador en `LIBRO`.

**2FN.** Todas las tablas tienen PK simple (identity), así que no puede haber dependencias parciales. La única PK compuesta, `LIBRO_AUTOR (ID_LIBRO, ID_AUTOR)`, no tiene atributos no clave.

**3FN.** Ningún atributo no clave depende de otro atributo no clave:

| Tabla | Dependencias funcionales | Justificación |
|-------|--------------------------|---------------|
| ROL | ID_ROL → NOMBRE, DESCRIPCION, DIAS_PRESTAMO, MAX_PRESTAMOS | Las reglas de préstamo dependen solo del rol |
| USUARIO | ID_USUARIO → CODIGO, NOMBRES, …, ID_ROL, USERNAME, PASSWORD_HASH | Los datos del rol (días, límite) no se copian en USUARIO; se obtienen por ID_ROL |
| AUTOR | ID_AUTOR → NOMBRES, APELLIDOS, NACIONALIDAD | |
| EDITORIAL | ID_EDITORIAL → NOMBRE, PAIS | El país vive en EDITORIAL, no en LIBRO |
| CATEGORIA | ID_CATEGORIA → NOMBRE, DESCRIPCION | |
| LIBRO | ID_LIBRO → ISBN, TITULO, …, ID_EDITORIAL, ID_CATEGORIA, ESTADO | Nombre de editorial/categoría no se repite en LIBRO; tampoco se guarda el total de ejemplares (derivable) |
| LIBRO_AUTOR | (ID_LIBRO, ID_AUTOR) → ∅ | Tabla asociativa |
| EJEMPLAR | ID_EJEMPLAR → ID_LIBRO, CODIGO_BARRAS, ESTADO, FECHA_ADQUISICION | Los datos bibliográficos se obtienen por ID_LIBRO |
| PRESTAMO | ID_PRESTAMO → ID_USUARIO, ID_EJEMPLAR, ID_BIBLIOTECARIO, FECHA_PRESTAMO, FECHA_DEVOLUCION_PREVISTA, ESTADO | No se guarda el libro (se llega por el ejemplar). FECHA_DEVOLUCION_PREVISTA se conserva como hecho histórico: si cambian los DIAS_PRESTAMO del rol, los préstamos ya hechos no deben cambiar |
| DEVOLUCION | ID_DEVOLUCION → ID_PRESTAMO, FECHA_DEVOLUCION_REAL, A_TIEMPO, DIAS_RETRASO, OBSERVACIONES, ID_BIBLIOTECARIO | A_TIEMPO y DIAS_RETRASO los calcula `PKG_BIBLIOTECA` en la devolución y no se editan después. A_TIEMPO se deriva de DIAS_RETRASO (A_TIEMPO = 'S' ⇔ DIAS_RETRASO = 0): es una **desnormalización controlada** que pide el enunciado ("verificar si fue dentro del plazo") y simplifica los reportes. Un CHECK (`CK_DEVOLUCION_COHERENCIA`) impide que ambos valores se contradigan |
| BITACORA | ID_BITACORA → FECHA_HORA, USUARIO, TABLA, OPERACION, ID_REGISTRO, DATOS_ANTERIORES, DATOS_NUEVOS | Tabla de registro, sin dependencias transitivas |
