# Contrato de la API REST

Base: `http://localhost:8080/api` · Swagger: `http://localhost:8080/swagger-ui.html` (botón **Authorize** → pegar el token).
Autenticación: cabecera `Authorization: Bearer <token>` obtenida en `/auth/login`. Fechas en formato `YYYY-MM-DD`.

Errores: siempre `{ "codigo": "...", "mensaje": "..." }`.

| HTTP | Cuándo | `codigo` |
|------|--------|----------|
| 400 | Validación de campos, formato o dato inválido | `VALIDACION`, `SOLICITUD_INVALIDA`, `DATO_INVALIDO`, `REFERENCIA_INVALIDA`, `ORA-20012` |
| 401 | Sin token, token vencido o credenciales incorrectas | `NO_AUTENTICADO`, `CREDENCIALES_INVALIDAS`, `USUARIO_INACTIVO` |
| 403 | El rol no tiene permiso | `PROHIBIDO`, `ORA-20003` |
| 404 | El recurso no existe | `NO_ENCONTRADO`, `ORA-20001`, `ORA-20006`, `ORA-20010` |
| 409 | Regla de negocio o integridad | `ORA-20002`, `ORA-20004`, `ORA-20005`, `ORA-20007`, `ORA-20008`, `ORA-20011`, `DUPLICADO`, `EN_USO`, `CONFLICTO` |

## Endpoints

| Método y ruta | Roles | Cuerpo / parámetros | Respuesta |
|---------------|-------|---------------------|-----------|
| `POST /auth/login` | público | `{username, password}` | `{token, idUsuario, username, nombre, rol}` |
| `GET /roles` | todos | | `[{id, nombre, descripcion, diasPrestamo, maxPrestamos}]` |
| `GET /usuarios` · `GET /usuarios/{id}` | ADMIN, BIBLIOTECARIO | | `[{id, codigo, nombres, apellidos, correo, telefono, direccion, fechaRegistro, estado, idRol, rol, username}]` |
| `POST /usuarios` | ADMIN, BIBLIOTECARIO (solo PROFESOR/ESTUDIANTE) | `{codigo, nombres, apellidos, correo, telefono?, direccion?, estado?, idRol, username, password}` | usuario (201) |
| `PUT /usuarios/{id}` | ADMIN | igual que POST; `password` opcional (vacío = no cambia) | usuario |
| `DELETE /usuarios/{id}` | ADMIN | | 204, lo marca inactivo (`ESTADO='I'`) |
| `GET /autores` · `/{id}` | todos | | `[{id, nombres, apellidos, nacionalidad}]` |
| `POST /autores` · `PUT /autores/{id}` · `DELETE /autores/{id}` | ADMIN, BIBLIOTECARIO | `{nombres, apellidos, nacionalidad?}` | autor / 204 (409 `EN_USO` si tiene libros) |
| `GET /editoriales` · `/{id}` | todos | | `[{id, nombre, pais}]` |
| `POST/PUT/DELETE /editoriales` | ADMIN, BIBLIOTECARIO | `{nombre, pais?}` | editorial / 204 |
| `GET /categorias` · `/{id}` | todos | | `[{id, nombre, descripcion}]` |
| `POST/PUT/DELETE /categorias` | ADMIN, BIBLIOTECARIO | `{nombre, descripcion?}` | categoría / 204 |
| `GET /libros` · `/{id}` | todos | | `[{id, isbn, titulo, anioPublicacion, edicion, idioma, numPaginas, idEditorial, editorial, idCategoria, categoria, estado, autores:[autor], totalEjemplares, disponibles}]` |
| `POST /libros` · `PUT /libros/{id}` | ADMIN, BIBLIOTECARIO | `{isbn, titulo, anioPublicacion?, edicion?, idioma?, numPaginas?, idEditorial, idCategoria, estado?, idsAutores:[id]}` | libro |
| `DELETE /libros/{id}` | ADMIN, BIBLIOTECARIO | | 204, lo marca inactivo |
| `GET /ejemplares?idLibro=&estado=` · `/{id}` | todos | filtros opcionales | `[{id, idLibro, isbn, titulo, codigoBarras, estado, fechaAdquisicion}]` |
| `POST /ejemplares` · `PUT /ejemplares/{id}` | ADMIN, BIBLIOTECARIO | `{idLibro, codigoBarras, estado? (DISPONIBLE/DANADO/PERDIDO/INACTIVO), fechaAdquisicion?}` | ejemplar |
| `DELETE /ejemplares/{id}` | ADMIN, BIBLIOTECARIO | | 204, lo marca INACTIVO (409 si está prestado) |
| `GET /prestamos?soloAbiertos=true` · `/{id}` | ADMIN, BIBLIOTECARIO | | `[{id, idUsuario, codigoUsuario, usuario, idEjemplar, codigoBarras, idLibro, titulo, bibliotecario, fechaPrestamo, fechaDevolucionPrevista, estado, diasRestantes, fechaDevolucionReal, aTiempo, diasRetraso}]` |
| `POST /prestamos` | ADMIN, BIBLIOTECARIO | `{idUsuario, idEjemplar}` (el bibliotecario sale del token) | préstamo (201) o 409 con la regla violada |
| `GET /devoluciones` | ADMIN, BIBLIOTECARIO | | `[{id, idPrestamo, usuario, codigoBarras, titulo, fechaPrestamo, fechaDevolucionPrevista, fechaDevolucionReal, aTiempo, diasRetraso, observaciones, bibliotecario, estadoEjemplar}]` |
| `POST /devoluciones` | ADMIN, BIBLIOTECARIO | `{idPrestamo, observaciones?, estadoEjemplar? (DISPONIBLE/DANADO/PERDIDO)}` | devolución (201), con `aTiempo` y `diasRetraso` |
| `GET /historial` | todos | | préstamos **del usuario del token** (mismo formato que `/prestamos`) |
| `GET /bitacora?tabla=&operacion=&usuario=&desde=&hasta=&pagina=0&tamanio=20` | ADMIN | filtros opcionales | `{contenido:[{id, fechaHora, usuario, tabla, operacion, idRegistro, datosAnteriores, datosNuevos}], total, pagina, tamanio}` |
| `GET /reportes/resumen` | ADMIN, BIBLIOTECARIO | | `{PRESTAMOS_ACTIVOS, PRESTAMOS_VENCIDOS, EJEMPLARES_DISPONIBLES, LIBROS_ACTIVOS, USUARIOS_ACTIVOS, DEVOLUCIONES_ULTIMOS_30_DIAS}` |
| `GET /reportes/{nombre}` | ADMIN, BIBLIOTECARIO | `nombre`: `libros-mas-prestados`, `prestamos-activos`, `prestamos-vencidos`, `prestamos-por-mes`, `prestamos-por-usuario`, `inventario-por-categoria`, `devoluciones-a-tiempo-vs-tarde` | filas de la vista `VW_*` (columnas en MAYÚSCULAS) |
| `GET /reportes/{nombre}/export?formato=csv\|xlsx` | ADMIN, BIBLIOTECARIO | | archivo descargable |
