# PLAN DE TRABAJO — Proyecto Final Base de Datos I (Biblioteca Universitaria)

> **Cómo usar este archivo:** es el contexto maestro para trabajar con Claude Code (copiarlo como `CLAUDE.md` en la raíz del repo o referenciarlo con `@CLAUDE.md`). Está dividido en **fases secuenciales con pasos numerados**, sin fechas. Cada paso tiene entregable y criterio de aceptación. Al terminar un paso, marcar la casilla `[x]` y hacer commit.
>
> **Leyenda:** 🤖 = lo genera/ejecuta Claude Code · 👤 = lo hace una persona (decisiones, validación visual, capturas, subir el link) · 🤝 = Claude Code lo prepara y la persona lo valida.

---

## 1. CONTEXTO DEL PROYECTO

**Curso:** Base de Datos I (segundo semestre).
**Objetivo:** diseñar un modelo entidad-relación para una **biblioteca universitaria**, implementarlo en **Oracle**, y construir una aplicación funcional que haga CRUD sobre la BD.
**Equipo:** hasta 5 personas; todos deben participar y se evalúa a cada uno de forma independiente.
**Entrega:** SOLO un link a una carpeta en la nube con todos los documentos. **Nada impreso.** Subir al portal a más tardar el **viernes 30/10/2026 a las 11:59**. Sin prórroga.

### 1.1 Rúbrica (13 puntos)

| No. | Entregable | Pts | Qué se evalúa |
|-----|-----------|-----|---------------|
| 1 | Modelo Entidad-Relación | 8 | ER correcto, completo, normalizado, coherente con lo implementado |
| 2 | Aplicación con CRUD sobre la BD (el enunciado dice "puede usar APEX"; no es obligatorio) | 3 | Crear/leer/actualizar/eliminar funcionando |
| 3 | Seguridad y roles | 1 | Cada usuario accede solo a las opciones de su rol |
| 4 | Reportes / resúmenes (Power BI, Excel, etc.) | 1 | Reportes con resumen de información |

### 1.2 Funcionalidades requeridas (del enunciado)

1. **Registro de usuarios:** estudiantes, profesores y personal de biblioteca se registran con su información personal.
2. **Gestión de libros:** el personal agrega libros, actualiza información y registra número de ejemplares disponibles.
3. **Préstamos:** el usuario solicita préstamo; el sistema verifica ejemplares disponibles y registra fecha de préstamo y fecha de devolución prevista.
4. **Devoluciones:** se registra la devolución; el sistema verifica si fue dentro del plazo.
5. *(El enunciado no tiene el punto 5; salta del 4 al 6.)*
6. **Historial de préstamos:** el usuario ve su historial y cuándo debe devolver los libros prestados.
7. **Bitácoras:** llevar registro de operaciones.

### 1.3 Tareas formales del enunciado
Diseñar esquema (tablas, campos, PK, FK) · Crear modelo ER · Implementar en Oracle · Interfaz de usuario (web/escritorio/móvil) · Documentar diseño, ER, esquema y funcionalidades · Preparar presentación.

---

## 2. DECISIONES TÉCNICAS (ya definidas por el equipo)

| # | Decisión | Valor |
|---|----------|-------|
| D1 | Gestor de BD | **Oracle XE en contenedor Docker** (imagen `gvenzl/oracle-xe`, p. ej. tag `21-slim-faststart`; verificar el tag vigente en Docker Hub) |
| D2 | Backend | **Java 21 + Spring Boot 4.0.x** (Spring Initializr ya no ofrece 3.x; springdoc 3.0.x), Maven (con Maven Wrapper `mvnw`), Spring Web, Spring Data JPA + `JdbcTemplate`/`SimpleJdbcCall` para llamar procedimientos PL/SQL, Spring Security + JWT, Bean Validation, springdoc-openapi (Swagger) |
| D3 | Frontend | **Angular 17+ (standalone components)**, Angular Material, Chart.js (ng2-charts) o ngx-charts, HttpClient con interceptor JWT y guards por rol |
| D4 | Ejemplares | Tabla `EJEMPLAR` individual (código de barras y estado por copia) |
| D5 | Claves primarias | `NUMBER GENERATED ALWAYS AS IDENTITY` |
| D6 | Reportes | Vistas SQL → endpoints REST → gráficas en Angular + exportación a CSV/Excel (Apache POI o CSV simple). Opcional: Power BI/Excel sobre los CSV |
| D7 | Lógica de negocio crítica | Dentro de Oracle (paquete PL/SQL `PKG_BIBLIOTECA`), el backend solo la invoca. Así se demuestra el uso de la BD y funciona igual desde cualquier cliente |
| D8 | Idioma | Tablas/columnas en **español**, sin tildes, `MAYUSCULAS_CON_GUION_BAJO`. Código Java/TS en inglés o español, pero consistente |
| D9 | Sincronización entre computadoras | **Repositorio Git remoto (GitHub/GitLab)**; todo (scripts SQL, docker-compose, backend, frontend) vive en el repo. Cada integrante levanta su propia BD local con un comando |
| D10 | Herramienta ER | **Oracle SQL Developer Data Modeler** (ER oficial). Se genera **importando el diccionario de datos de la BD ya creada en Oracle XE** (ingeniería inversa), no dibujándolo a mano. Antes de eso, un borrador en Mermaid (`modelo/er.mmd`) sirve solo como guía de diseño |

---

## 3. ARQUITECTURA

```
┌────────────────┐   HTTP/JSON + JWT   ┌──────────────────────┐   JDBC   ┌───────────────────────┐
│ Angular (4200) │ ──────────────────► │ Spring Boot (8080)   │ ───────► │ Oracle XE (Docker)    │
│ CRUD, roles,   │ ◄────────────────── │ REST, seguridad,     │ ◄─────── │ Tablas, triggers,     │
│ reportes       │                     │ llama a PKG_BIBLIOTECA│          │ PKG_BIBLIOTECA, vistas│
└────────────────┘                     └──────────────────────┘          │ puerto 1521, XEPDB1   │
                                                                         └───────────────────────┘
```

### 3.1 Estructura del repositorio (monorepo)

```
proyecto-biblioteca/
├── CLAUDE.md                        # este plan
├── README.md                        # guía de instalación para cualquier computadora
├── PROGRESO.md                      # control de avance compartido: qué está hecho, en curso y pendiente (ver protocolo en sección 9)
├── docker-compose.yml               # servicio oracle (y opcional backend/frontend)
├── .env.example                     # variables (copiar a .env, NO subir .env)
├── .gitignore
├── scripts/
│   ├── db-up.sh / db-up.ps1         # levanta Oracle y espera a que esté listo
│   ├── db-install.sh / db-install.ps1  # ejecuta TODOS los scripts de db/ en orden dentro del contenedor
│   ├── db-reset.sh / db-reset.ps1   # borra volumen y reinstala todo desde cero
│   ├── db-test.sh / db-test.ps1     # ejecuta db/99_pruebas.sql y muestra resultado
│   └── db-sql.sh / db-sql.ps1       # abre sqlplus interactivo como usuario de la app
├── db/
│   ├── 00_drop_all.sql
│   ├── 01_tablas.sql
│   ├── 02_constraints_indices.sql
│   ├── 03_datos_catalogos.sql
│   ├── 04_datos_prueba.sql
│   ├── 05_bitacora_triggers.sql
│   ├── 06_paquete_biblioteca.sql
│   ├── 07_vistas_reportes.sql
│   ├── 08_seguridad_datos.sql       # usuarios de prueba por rol con password hasheado (BCrypt)
│   ├── 99_pruebas.sql
│   ├── install_all.sql              # master: @@00 ... @@08 en orden (para sqlplus/SQLcl)
│   └── README.md                    # orden de ejecución y qué hace cada script
├── modelo/
│   ├── er.mmd
│   ├── biblioteca.dmd             # proyecto de Oracle SQL Developer Data Modeler
│   ├── er.png / er.pdf            # export final desde Data Modeler
│   └── diccionario_datos.md
├── backend/                         # Spring Boot
│   ├── pom.xml, mvnw, mvnw.cmd
│   └── src/main/java/.../{config,security,entity,repository,service,controller,dto,exception}
├── frontend/                        # Angular
│   └── src/app/{core,auth,shared,features/{usuarios,libros,ejemplares,catalogos,prestamos,devoluciones,historial,reportes,bitacora}}
├── reportes/                        # CSV/Excel/Power BI opcionales
├── docs/
│   ├── documentacion_final.md
│   └── capturas/
└── presentacion/
    └── guion_demo.md
```

### 3.2 Docker: requisitos de replicabilidad

- `docker-compose.yml` con servicio `oracle`:
  - imagen `gvenzl/oracle-xe`, puerto `1521:1521`, **volumen nombrado** para persistir datos, healthcheck (`healthcheck.sh` incluido en la imagen).
  - variables desde `.env`: `ORACLE_PASSWORD` (SYS/SYSTEM), `APP_USER` (p. ej. `BIBLIOTECA`), `APP_USER_PASSWORD`. Con `APP_USER` la imagen crea el usuario en `XEPDB1`.
  - Conexión JDBC: `jdbc:oracle:thin:@//localhost:1521/XEPDB1`.
- **Cada máquina puede tener un contenedor distinto** (nombre, imagen, puerto, service name). Por eso **ningún script puede tener esos valores fijos**: todos los `scripts/db-*` leen `DB_CONTAINER`, `DB_PORT`, `DB_SERVICE`, `DB_SYSTEM_PASSWORD`, `APP_USER` y `APP_USER_PASSWORD` del `.env` local, y el backend arma su URL JDBC con esas mismas variables. Si ya existe un contenedor Oracle, se reutiliza; el `docker-compose.yml` solo se usa cuando no hay uno.
- **Los scripts SQL no dependen del auto-init de la imagen:** se ejecutan explícitamente con `scripts/db-install.*`, que hace `docker exec` de `sqlplus` (o SQLcl) como `APP_USER` contra `XEPDB1` y corre `db/install_all.sql`. Esto garantiza que cualquier integrante obtenga exactamente la misma BD en su máquina.
- Cada script de PL/SQL (procedimientos, paquetes, triggers) termina con `/` en línea aparte; `install_all.sql` usa `WHENEVER SQLERROR` configurado para detenerse o mostrar errores claramente, y `SET DEFINE OFF`.
- Requisitos por máquina: Docker Desktop (≈2 GB de RAM libres para Oracle XE), JDK 21/17, Node 20+ y Angular CLI, Git. Documentarlo en `README.md`.
- *Nota:* Claude Code debe verificar en la documentación vigente de la imagen `gvenzl/oracle-xe` el tag, las variables y el nombre del PDB antes de fijar `docker-compose.yml`.

---

## 4. CONVENCIONES (Claude Code debe respetarlas siempre)

- **Nombres SQL:** tablas en singular (`USUARIO`, `LIBRO`), PK = `ID_<TABLA>`, FK con el mismo nombre que la PK referenciada. Prefijos: `PK_`, `FK_`, `UK_`, `CK_`, `IX_`, `TRG_`, `SP_`, `FN_`, `VW_`, `PKG_`.
- **Tipos:** `VARCHAR2(n CHAR)`, `NUMBER(10)`, `DATE` para fechas de negocio, `TIMESTAMP` para bitácora, `CHAR(1)` con CHECK `('S','N')` para booleanos.
- **Scripts SQL:** cabecera corta de 1–3 líneas con el propósito del script y nada más de comentarios en el cuerpo (el orden de ejecución se documenta en `db/README.md`); ejecutables en orden; `00_drop_all.sql` tolerante (ignora errores de objetos inexistentes) para poder reinstalar.
- **Todo cambio de esquema** se refleja a la vez en: script SQL → entidades JPA → diccionario de datos → ER.
- **Backend:** capas controller → service → repository; DTOs separados de entidades; excepciones de negocio traducidas a HTTP (400/403/404/409) con cuerpo JSON `{codigo, mensaje}`; los errores `ORA-20xxx` se mapean a mensajes legibles.
- **Frontend:** un módulo/feature por entidad; servicios por recurso; formularios reactivos con validación; mensajes con `MatSnackBar`; confirmación antes de eliminar.
- **Secretos:** nada de contraseñas reales en el repo; `.env` en `.gitignore`, `.env.example` con valores de prueba.
- **Git:** Claude Code ejecuta `git pull` **al iniciar** la sesión y `git add` **al terminar** cada paso; **nunca** `git commit`, `git push`, `git merge`, `git rebase`, `git reset` ni `git checkout` sobre cambios sin guardar. Si el `git pull` falla por conflictos o por cambios locales sin guardar, se detiene, explica y pregunta; no resuelve conflictos a ciegas. La persona revisa lo que quedó en staging (`git diff --staged`), hace el commit y el push. Mensaje de commit sugerido por paso completado: `[paso 2.2] descripción corta`.
- **Control de avance obligatorio:** el archivo `PROGRESO.md` es la fuente de verdad de qué se ha hecho y qué sigue. Se lee **al iniciar** y se actualiza **al terminar** cada paso, siguiendo el protocolo de la sección 9. Nadie empieza un paso sin hacer `git pull` y revisar `PROGRESO.md`.
- **Sin comentarios en el código** (Java, TypeScript, HTML/SCSS, ni dentro del cuerpo de SQL/PL/SQL). **Única excepción:** los scripts SQL llevan una **cabecera corta** (1–3 líneas con `--`) que indica para qué sirve el script. Los nombres claros reemplazan a los comentarios; lo que haya que explicar va en `db/README.md`, `docs/` o en el chat. Los **mensajes de error que ve el usuario** sí van en español.
- **Código simple:** lo mínimo que cumpla el requisito. Sin sobreingeniería: nada de abstracciones, interfaces, patrones, mapeadores ni librerías que no se necesiten o que no se hayan pedido. Se mantienen las capas controller → service → repository, pero sin añadir más.

---

## 5. MODELO DE DATOS DE REFERENCIA

> Punto de partida para el ER y el DDL. Se puede ajustar en la Fase 1; lo aprobado ahí se congela.

### 5.1 Entidades y atributos

**ROL** — `ID_ROL` PK · `NOMBRE` UK (ADMIN, BIBLIOTECARIO, PROFESOR, ESTUDIANTE) · `DESCRIPCION` · `DIAS_PRESTAMO` NUMBER(3) · `MAX_PRESTAMOS` NUMBER(2)

**USUARIO** — `ID_USUARIO` PK · `CODIGO` UK (carné/código empleado) · `NOMBRES` · `APELLIDOS` · `CORREO` UK · `TELEFONO` · `DIRECCION` · `FECHA_REGISTRO` DATE default SYSDATE · `ESTADO` CHECK ('A','I') · `ID_ROL` FK→ROL · `USERNAME` UK (login) · `PASSWORD_HASH` VARCHAR2(100) (BCrypt)

**AUTOR** — `ID_AUTOR` PK · `NOMBRES` · `APELLIDOS` · `NACIONALIDAD`

**EDITORIAL** — `ID_EDITORIAL` PK · `NOMBRE` UK · `PAIS`

**CATEGORIA** — `ID_CATEGORIA` PK · `NOMBRE` UK · `DESCRIPCION`

**LIBRO** — `ID_LIBRO` PK · `ISBN` UK · `TITULO` · `ANIO_PUBLICACION` · `EDICION` · `IDIOMA` · `NUM_PAGINAS` · `ID_EDITORIAL` FK · `ID_CATEGORIA` FK · `ESTADO` ('A','I')
*(Los totales de ejemplares se calculan desde EJEMPLAR, no se guardan.)*

**LIBRO_AUTOR** (N:M) — `ID_LIBRO` FK + `ID_AUTOR` FK, PK compuesta.

**EJEMPLAR** — `ID_EJEMPLAR` PK · `ID_LIBRO` FK · `CODIGO_BARRAS` UK · `ESTADO` CHECK ('DISPONIBLE','PRESTADO','DANADO','PERDIDO') · `FECHA_ADQUISICION`

**PRESTAMO** — `ID_PRESTAMO` PK · `ID_USUARIO` FK (solicitante) · `ID_EJEMPLAR` FK · `ID_BIBLIOTECARIO` FK→USUARIO · `FECHA_PRESTAMO` DATE · `FECHA_DEVOLUCION_PREVISTA` DATE · `ESTADO` CHECK ('ACTIVO','DEVUELTO','VENCIDO') · CHECK `FECHA_DEVOLUCION_PREVISTA >= FECHA_PRESTAMO`

**DEVOLUCION** — `ID_DEVOLUCION` PK · `ID_PRESTAMO` FK UK (1:1) · `FECHA_DEVOLUCION_REAL` DATE · `A_TIEMPO` CHAR(1) · `DIAS_RETRASO` NUMBER(4) · `OBSERVACIONES` · `ID_BIBLIOTECARIO` FK→USUARIO

**BITACORA** — `ID_BITACORA` PK · `FECHA_HORA` TIMESTAMP · `USUARIO` · `TABLA` · `OPERACION` CHECK ('INSERT','UPDATE','DELETE') · `ID_REGISTRO` · `DATOS_ANTERIORES` CLOB · `DATOS_NUEVOS` CLOB

### 5.2 Relaciones

| Relación | Cardinalidad |
|----------|-------------|
| ROL — USUARIO | 1:N |
| EDITORIAL — LIBRO | 1:N |
| CATEGORIA — LIBRO | 1:N |
| LIBRO — AUTOR | N:M (vía LIBRO_AUTOR) |
| LIBRO — EJEMPLAR | 1:N |
| USUARIO — PRESTAMO (solicitante) | 1:N |
| USUARIO — PRESTAMO (bibliotecario que registra) | 1:N |
| EJEMPLAR — PRESTAMO | 1:N (solo 1 préstamo ACTIVO a la vez por ejemplar) |
| PRESTAMO — DEVOLUCION | 1:0..1 |

### 5.3 Reglas de negocio

- RN1: Un préstamo solo puede crearse si el ejemplar está `DISPONIBLE`.
- RN2: Al crear el préstamo, el ejemplar pasa a `PRESTADO`; al devolver vuelve a `DISPONIBLE` (salvo que se reporte `DANADO`/`PERDIDO`).
- RN3: `FECHA_DEVOLUCION_PREVISTA = FECHA_PRESTAMO + ROL.DIAS_PRESTAMO` (sugerido: estudiante 7, profesor 15, bibliotecario 15, admin 15).
- RN4: Un usuario no puede superar `ROL.MAX_PRESTAMOS` préstamos ACTIVOS (sugerido: estudiante 3, profesor 5).
- RN5: Un usuario con algún préstamo vencido no puede pedir otro.
- RN6: Un usuario `INACTIVO` no puede pedir préstamos.
- RN7: En la devolución, `A_TIEMPO='S'` si `FECHA_DEVOLUCION_REAL <= FECHA_DEVOLUCION_PREVISTA`; si no `'N'` y `DIAS_RETRASO` = diferencia en días.
- RN8: Un préstamo ya devuelto no se puede devolver otra vez.
- RN9: Toda inserción/modificación/eliminación en tablas críticas queda en BITACORA (con usuario de la aplicación).
- RN10: No se elimina físicamente un usuario/libro/ejemplar con historial; se marca inactivo.

---

## 6. PLAN DE EJECUCIÓN POR FASES

Orden estricto: **no avanzar sin cumplir los criterios de aceptación de la fase anterior**, salvo las paralelizaciones indicadas.

---

### FASE 0 — Repositorio y entorno Docker

| # | Paso | Resp. | Entregable | Criterio de aceptación |
|---|------|-------|-----------|------------------------|
| 0.1 | Crear repo remoto (GitHub/GitLab), invitar a todo el equipo, clonar localmente | 👤 | Repo compartido | Todos pueden hacer `git pull/push` |
| 0.2 | Crear estructura de carpetas (sección 3.1), `.gitignore` (Java, Node, `.env`, IDEs), copiar este plan como `CLAUDE.md` | 🤖 | Archivos en staging (`git add`) | `git status` muestra todo en staging, listo para que la persona revise y haga el primer commit |
| 0.2a | Crear `PROGRESO.md` con la plantilla de la sección 9 y **poblar la tabla de tareas con todos los pasos de este plan** (fase, número, descripción, responsable sugerido, estado ⬜). Dejarlo en staging (`git add`); la persona lo revisa, hace commit y push para que todos lo reciban | 🤖 | `PROGRESO.md` en el repo | Todos los pasos del plan aparecen en la tabla; el resto del equipo lo ve tras `git pull` |
| 0.2b | **Reutilizar el Oracle ya instalado en Docker de cada máquina:** Claude Code ejecuta `docker ps -a`, `docker images`, `docker inspect <contenedor>` y `docker logs <contenedor> --tail 30` para descubrir nombre del contenedor, imagen, puerto, service name (`XEPDB1` o `XE`) y estado. **No crea otro contenedor** si ya hay uno funcionando. Con lo descubierto genera el `.env` local de esa máquina | 🤖 (en cada computadora) | `.env` por máquina (no se sube a Git) | `.env` con `DB_CONTAINER`, `DB_PORT`, `DB_SERVICE`, `DB_SYSTEM_PASSWORD`, `APP_USER`, `APP_USER_PASSWORD`; el contenedor responde a un `SELECT 'OK' FROM dual` |
| 0.2c | Script `scripts/db-create-user.*`: entra como `SYSTEM` al contenedor existente y crea el usuario `APP_USER` (con `CREATE SESSION`, `CREATE TABLE`, `CREATE VIEW`, `CREATE SEQUENCE`, `CREATE PROCEDURE`, `CREATE TRIGGER`, cuota en el tablespace) **solo si no existe** | 🤖 | Script idempotente | Se puede ejecutar varias veces sin error |
| 0.3 | Crear `docker-compose.yml` (**opcional**, solo para quien no tenga contenedor Oracle), `.env.example` y scripts `scripts/db-up`, `db-install`, `db-reset`, `db-test`, `db-sql` (versión `.sh` **y** `.ps1`) | 🤖 | Archivos | `docker compose up -d` levanta Oracle y el healthcheck pasa a *healthy* |
| 0.4 | Escribir `README.md` con prerrequisitos y pasos "de cero a funcionando" en otra computadora | 🤖 | README | Un integrante nuevo lo sigue sin ayuda |
| 0.5 | Probar la conexión: `scripts/db-sql` → `SELECT 'OK' FROM dual;` | 🤝 | Salida OK | Funciona en al menos 2 computadoras distintas |
| 0.6 | Repartir módulos (sección 8) | 👤 | Tabla completa | Cada persona tiene tareas |
| 0.7 | Crear carpeta en la nube con subcarpetas (Modelo, Scripts, Aplicacion, Reportes, Documentacion, Presentacion) | 👤 | Link | Acceso de edición para todos |

---

### FASE 1 — Diseño del modelo (base del ER, 8 pts) ⭐ prioridad máxima

> **Flujo del ER (Camino B):** primero se diseña y congela el modelo en texto (esta fase), luego se crean las tablas en Oracle (Fase 2) y **después** se genera el diagrama ER oficial con Oracle SQL Developer Data Modeler importando la BD (pasos 2.9–2.12). Así el ER coincide exactamente con lo implementado.

| # | Paso | Resp. | Entregable | Criterio de aceptación |
|---|------|-------|-----------|------------------------|
| 1.1 | Revisar la sección 5, proponer ajustes y señalar dudas al equipo | 🤖→👤 | Lista de ajustes | Equipo aprueba |
| 1.2 | Generar un **borrador** del ER en Mermaid (`modelo/er.mmd`) con PK/FK y cardinalidades, solo como guía de diseño (no es el entregable) | 🤖 | `er.mmd` | Renderiza y muestra las 11 entidades |
| 1.3 | *Diferido:* el ER oficial (PNG/PDF) se genera con Data Modeler tras crear la BD → ver pasos 2.9–2.12 | — | — | — |
| 1.4 | Verificar normalización hasta **3FN**: dependencias funcionales por tabla y justificación | 🤖 | Sección en `diccionario_datos.md` | Sin multivalores ni dependencias transitivas |
| 1.5 | **Diccionario de datos** (tabla, columna, tipo, nulo, PK/FK/UK, descripción) | 🤖 | `modelo/diccionario_datos.md` | 100 % de columnas cubiertas |
| 1.6 | **Congelar el modelo** (el ER aprobado es la fuente de verdad) | 👤 | Commit "ER aprobado" | Aprobación explícita |

---

### FASE 2 — Base de datos en Oracle (scripts replicables)

| # | Paso | Resp. | Entregable | Criterio de aceptación |
|---|------|-------|-----------|------------------------|
| 2.1 | `00_drop_all.sql` (borra objetos en orden inverso, ignora los inexistentes) | 🤖 | Script | Corre sobre BD vacía o llena |
| 2.2 | `01_tablas.sql` (PK identity, FK, UNIQUE, NOT NULL) | 🤖 | Script | 11 tablas creadas |
| 2.3 | `02_constraints_indices.sql` (CHECKs e índices en FKs y campos de búsqueda: `ISBN`, `CODIGO`, `USERNAME`, `TITULO`, `ESTADO`) | 🤖 | Script | Valores inválidos son rechazados |
| 2.4 | `03_datos_catalogos.sql` (ROL con días y límites, CATEGORIA, EDITORIAL, AUTOR) | 🤖 | Script | 4 roles con reglas |
| 2.5 | `04_datos_prueba.sql`: ≥10 usuarios (≥2 por rol), ≥20 libros con autores, ≥40 ejemplares, ≥15 préstamos (activos, devueltos a tiempo, devueltos tarde, vencidos) | 🤖 | Script | Casos para demostrar RN1–RN8 |
| 2.6 | `install_all.sql` (master con `@@` en orden) y `db/README.md` | 🤖 | Archivos | `scripts/db-install` instala todo con un comando |
| 2.7 | Probar `scripts/db-reset` + `scripts/db-install` desde cero | 🤖🤝 | Log | Cero errores; conteos por tabla correctos |
| 2.8 | Verificar esquema real vs ER/diccionario consultando `USER_TAB_COLUMNS` y `USER_CONSTRAINTS` | 🤖 | Informe de diferencias | Vacío |
| 2.9 | **Importar la BD en Oracle SQL Developer Data Modeler** (instalarlo si no está): *File → Import → Data Dictionary* → nueva conexión (host `localhost`, puerto `1521`, **Service name `XEPDB1`**, usuario y contraseña del `APP_USER` del `.env`) → elegir el esquema de la app → seleccionar las 11 tablas → Finish. Resultado: **Modelo Relacional** con todas las tablas, PK, FK y relaciones | 👤 (🤖 deja la guía en `modelo/guia_data_modeler.md`) | Proyecto Data Modeler | Aparecen las 11 tablas con sus relaciones |
| 2.10 | Generar el **Modelo Lógico**: clic derecho sobre el modelo relacional → *Engineer to Logical Model*. Renombrar entidades y relaciones con nombres legibles (p. ej. "pertenece a", "registra", "tiene"), y revisar cardinalidades/opcionalidad | 👤 | Modelo lógico | Entidades, atributos, claves y cardinalidades correctas (coinciden con la sección 5) |
| 2.11 | Acomodar los diagramas (lógico y relacional): sin líneas cruzadas innecesarias, notación **pie de gallo** (*Tools → Preferences → Diagram → Notation*), mostrar PK/FK y tipos de dato | 👤 | Diagramas ordenados | Legibles al exportarse |
| 2.12 | Guardar el proyecto en `modelo/biblioteca.dmd` y exportar a **PDF/PNG** (*File → Export → To PDF* o *File → Print Diagram → To Image File*) como `modelo/er.pdf` / `er.png`; subir también a la carpeta en la nube | 👤 | `.dmd`, `er.pdf`, `er.png` | Archivos abren correctamente |
| 2.13 | **Validar en una segunda computadora**: `git pull` + `db-up` + `db-install` | 👤 | Confirmación | Mismos conteos de datos |

---

### FASE 3 — Lógica en Oracle (PL/SQL) y bitácora

| # | Paso | Resp. | Entregable | Criterio de aceptación |
|---|------|-------|-----------|------------------------|
| 3.1 | Triggers de bitácora (`05_bitacora_triggers.sql`): `AFTER INSERT/UPDATE/DELETE` en `USUARIO`, `LIBRO`, `EJEMPLAR`, `PRESTAMO`, `DEVOLUCION`. Usuario = `COALESCE(SYS_CONTEXT('USERENV','CLIENT_IDENTIFIER'), SYS_CONTEXT('USERENV','SESSION_USER'))`. El backend fija el `CLIENT_IDENTIFIER` con `DBMS_SESSION.SET_IDENTIFIER(<username>)` al iniciar cada operación y lo limpia al terminar (importante por el pool de conexiones) | 🤖 | Script | Cada DML deja una fila en BITACORA con el usuario de la app |
| 3.2 | Paquete `PKG_BIBLIOTECA` (`06_paquete_biblioteca.sql`): | 🤖 | Script | Compila sin errores (`SHOW ERRORS` vacío) |
| | • `SP_REGISTRAR_PRESTAMO(p_id_usuario, p_id_ejemplar, p_id_bibliotecario, OUT p_id_prestamo)` → valida RN1, RN4, RN5, RN6; calcula fecha (RN3); cambia estado del ejemplar (RN2) | | | |
| | • `SP_REGISTRAR_DEVOLUCION(p_id_prestamo, p_id_bibliotecario, p_observaciones, p_estado_ejemplar)` → valida RN8; calcula `A_TIEMPO`/`DIAS_RETRASO` (RN7); libera ejemplar | | | |
| | • `FN_EJEMPLARES_DISPONIBLES(p_id_libro)` · `SP_ACTUALIZAR_VENCIDOS` (marca VENCIDO los activos con fecha prevista < hoy) | | | |
| 3.3 | Errores de negocio con `RAISE_APPLICATION_ERROR(-20001..-20099)` y mensajes en español; tabla de códigos documentada en `docs/` | 🤖 | Códigos documentados | Cada regla violada devuelve un código distinto |
| 3.4 | `99_pruebas.sql`: casos felices y de error (sin ejemplar, límite, usuario inactivo, doble devolución, devolución tardía, trazas en bitácora) con el resultado esperado de cada caso descrito en `db/README.md` | 🤖 | Script | Todas las pruebas pasan |
| 3.5 | Ejecutar con `scripts/db-reset`, `db-install`, `db-test` y corregir | 🤖🤝 | Log limpio | Pruebas verdes |

---

### FASE 4 — Backend Java (Spring Boot): API REST + CRUD

| # | Paso | Resp. | Entregable | Criterio de aceptación |
|---|------|-------|-----------|------------------------|
| 4.1 | Crear proyecto (Spring Initializr: Web, Data JPA, Security, Validation, Oracle Driver `ojdbc11`, Lombok opcional). `application.yml` con perfil `local` leyendo variables de entorno/`.env` | 🤖 | `backend/` | `./mvnw spring-boot:run` conecta a Oracle |
| 4.2 | Entidades JPA mapeadas **exactamente** al esquema (`ddl-auto=none`/`validate`) | 🤖 | Paquete `entity` | La app arranca sin errores de mapeo |
| 4.3 | Repositories, services, controllers y DTOs para: Rol (solo lectura), Usuario, Autor, Editorial, Categoría, Libro (con autores), Ejemplar | 🤖 | Endpoints CRUD | Probados con Swagger/Postman |
| 4.4 | Endpoints de préstamos y devoluciones que invocan `PKG_BIBLIOTECA` vía `SimpleJdbcCall` | 🤖 | `PrestamoController`, `DevolucionController` | Violar una regla devuelve 409/400 con mensaje claro |
| 4.5 | Endpoint "mi historial" (usa el usuario del token, nunca un id enviado por el cliente) | 🤖 | `GET /api/historial` | Solo devuelve préstamos propios |
| 4.6 | Endpoint de bitácora (solo lectura, filtros por fecha/tabla/usuario, paginación) | 🤖 | `GET /api/bitacora` | Filtros funcionan |
| 4.7 | Fijar `CLIENT_IDENTIFIER` en cada operación (aspecto/`DataSource` wrapper o `@Transactional` + `DBMS_SESSION.SET_IDENTIFIER`) | 🤖 | Componente | La bitácora muestra el usuario real, no el esquema |
| 4.8 | Manejo global de excepciones (`@RestControllerAdvice`) que mapea `ORA-200xx` a mensajes legibles | 🤖 | Handler | Sin trazas de Oracle hacia el cliente |
| 4.9 | Documentar API con springdoc (`/swagger-ui.html`) y listar el **contrato** en `docs/api.md` (permite que el frontend avance en paralelo) | 🤖 | Swagger + `api.md` | Todos los endpoints documentados |
| 4.10 | Pruebas básicas (JUnit/Testcontainers opcional o pruebas de servicio con la BD local) | 🤖 | Tests | Pasan con `./mvnw test` |

**Endpoints mínimos (prefijo `/api`):**

| Recurso | Métodos | Roles permitidos |
|---------|---------|------------------|
| `/auth/login` | POST | público |
| `/usuarios` | GET, POST, PUT, DELETE (desactiva) | ADMIN (CRUD) · BIBLIOTECARIO (GET, POST) |
| `/libros`, `/ejemplares`, `/autores`, `/editoriales`, `/categorias` | GET · POST, PUT, DELETE | GET: todos · escritura: ADMIN, BIBLIOTECARIO |
| `/prestamos` | GET, POST | ADMIN, BIBLIOTECARIO |
| `/devoluciones` | GET, POST | ADMIN, BIBLIOTECARIO |
| `/historial` | GET | todos (solo propio) |
| `/reportes/*` | GET (+ `/export?formato=csv\|xlsx`) | ADMIN, BIBLIOTECARIO |
| `/bitacora` | GET | ADMIN |

---

### FASE 5 — Seguridad y roles (1 pt)

| # | Paso | Resp. | Entregable | Criterio de aceptación |
|---|------|-------|-----------|------------------------|
| 5.1 | `08_seguridad_datos.sql`: usuarios de prueba por rol con `PASSWORD_HASH` BCrypt (Claude Code genera los hashes; contraseñas de prueba documentadas en README) | 🤖 | Script | Existe un usuario por rol |
| 5.2 | Spring Security: login con JWT (expiración razonable), `BCryptPasswordEncoder`, filtro JWT, claims con rol | 🤖 | Config de seguridad | Login correcto/incorrecto responde 200/401 |
| 5.3 | Autorización por rol en los endpoints (`@PreAuthorize("hasRole('ADMIN')")` o reglas en `SecurityFilterChain`) según la matriz | 🤖 | Anotaciones | Acceso indebido responde 403 |
| 5.4 | CORS limitado a `http://localhost:4200` | 🤖 | Config | El frontend puede llamar a la API |
| 5.5 | Frontend: interceptor que añade el token, `AuthGuard` y `RoleGuard`, menú dinámico según rol, redirección a login si expira | 🤖 | `core/auth` | Un estudiante no ve ni puede abrir por URL las pantallas administrativas |
| 5.6 | Probar con cada rol (API y UI) y tomar capturas | 👤 | `docs/capturas/` | Coincide con la matriz |
| 5.7 | *(Opcional)* Roles de BD (`CREATE ROLE` / `GRANT`) como segunda capa | 🤖 | Sección en script | Documentado |

**Matriz de permisos:**

| Módulo / Acción | ADMIN | BIBLIOTECARIO | PROFESOR | ESTUDIANTE |
|-----------------|:-----:|:-------------:|:--------:|:----------:|
| Usuarios (CRUD) | ✅ | Ver / registrar | ❌ | ❌ |
| Libros, ejemplares, catálogos (CRUD) | ✅ | ✅ | Solo consulta | Solo consulta |
| Registrar préstamo / devolución | ✅ | ✅ | ❌ | ❌ |
| Mi historial | ✅ | ✅ | ✅ | ✅ |
| Reportes globales | ✅ | ✅ | ❌ | ❌ |
| Bitácora | ✅ | ❌ | ❌ | ❌ |

---

### FASE 6 — Frontend Angular (CRUD)  *(puede avanzar en paralelo con la Fase 4 usando `docs/api.md`)*

| # | Paso | Resp. | Entregable | Criterio de aceptación |
|---|------|-------|-----------|------------------------|
| 6.1 | Crear proyecto Angular (standalone, routing, SCSS), instalar Angular Material, configurar `environment` con `apiUrl`, `proxy.conf.json` opcional | 🤖 | `frontend/` | `ng serve` arranca |
| 6.2 | Estructura `core` (auth, interceptors, guards, layout con menú lateral por rol) y `shared` (tabla genérica, diálogo de confirmación, snackbar) | 🤖 | Código base | Login → layout funcionando |
| 6.3 | Pantallas CRUD con tabla paginada, búsqueda/filtro y formulario reactivo con validaciones: **Usuarios** (func. 1), **Libros** con autores/editorial/categoría (func. 2), **Ejemplares** (func. 2), **Catálogos** (autores, editoriales, categorías) | 🤖 | Features | Crear/editar/desactivar funciona contra la API real |
| 6.4 | **Nuevo préstamo** (func. 3): seleccionar usuario y ejemplar disponible; muestra fecha de devolución prevista y errores de regla de negocio | 🤖 | Feature | Casos válidos e inválidos se comportan según RN1–RN6 |
| 6.5 | **Devolución** (func. 4): lista de préstamos activos, botón devolver, resultado "a tiempo / con N días de retraso" | 🤖 | Feature | Cumple RN7 y RN8 |
| 6.6 | **Mi historial** (func. 6): préstamos propios con estado y fecha de devolución, resaltando vencidos/próximos a vencer | 🤖 | Feature | Solo muestra los propios |
| 6.7 | **Bitácora** (func. 7): tabla con filtros y paginación, solo ADMIN | 🤖 | Feature | Muestra operaciones recientes |
| 6.8 | **Dashboard de inicio** con indicadores (préstamos activos, vencidos, libros disponibles) | 🤖 | Feature | Datos reales |
| 6.9 | Pulir UX: loaders, mensajes de error de la API, confirmaciones, responsive básico | 🤖🤝 | — | Flujo principal sin errores visibles |

---

### FASE 7 — Reportes y resúmenes (1 pt)

| # | Paso | Resp. | Entregable | Criterio de aceptación |
|---|------|-------|-----------|------------------------|
| 7.1 | `07_vistas_reportes.sql`: `VW_LIBROS_MAS_PRESTADOS`, `VW_PRESTAMOS_ACTIVOS`, `VW_PRESTAMOS_VENCIDOS` (con días de retraso), `VW_PRESTAMOS_POR_MES`, `VW_PRESTAMOS_POR_USUARIO`, `VW_INVENTARIO_POR_CATEGORIA`, `VW_DEVOLUCIONES_A_TIEMPO_VS_TARDE` | 🤖 | Script | Devuelven datos con los datos de prueba |
| 7.2 | Endpoints `/api/reportes/*` (JSON) y `/api/reportes/{nombre}/export?formato=csv\|xlsx` | 🤖 | API | Descargan archivos que abren sin errores |
| 7.3 | Pantalla **Reportes** en Angular: ≥3 gráficas (barras: libros más prestados; pastel: inventario por categoría o a tiempo vs tarde; línea: préstamos por mes) + tablas + botón exportar | 🤖 | Feature | Gráficas con datos correctos |
| 7.4 | *(Opcional)* Power BI/Excel con tablas dinámicas sobre los CSV exportados, guardado en `reportes/` | 🤝 | Archivo | Abre correctamente |
| 7.5 | Capturas de cada reporte | 👤 | Imágenes | Legibles |

---

### FASE 8 — Documentación y presentación

| # | Paso | Resp. | Entregable | Criterio de aceptación |
|---|------|-------|-----------|------------------------|
| 8.1 | Mantener `docs/documentacion_final.md` desde el inicio y completarlo con el índice de abajo | 🤖🤝 | Documento fuente | Todas las secciones completas |
| 8.2 | Exportar a **Word o PDF** (no impreso) | 🤝 | `.docx`/`.pdf` | Formato limpio, imágenes legibles |
| 8.3 | `presentacion/guion_demo.md` (5–8 min) | 🤖 | Guion | Cubre ER → BD → app → roles → reportes → bitácora |
| 8.4 | Presentación (8–12 diapositivas) | 🤝 | `.pptx`/PDF | Cada integrante tiene una parte |
| 8.5 | **Grabar un video corto de demo** (3–5 min) como respaldo por si no se puede ejecutar el sistema en vivo | 👤 | Video en la carpeta | Se ve el flujo completo |
| 8.6 | Ensayo completo | 👤 | — | Sin fallos |

**Índice del documento final:** 1) Portada (curso, integrantes, carnés) · 2) Introducción y objetivos · 3) Descripción del sistema y funcionalidades · 4) Arquitectura y tecnologías (Oracle XE/Docker, Spring Boot, Angular) · 5) Modelo ER + explicación · 6) Diccionario de datos y esquema · 7) Normalización · 8) Reglas de negocio · 9) Triggers, procedimientos y bitácora · 10) API REST (resumen de endpoints) · 11) Manual de la aplicación con capturas · 12) Roles y matriz de permisos · 13) Reportes · 14) **Instalación y ejecución paso a paso** (Docker, scripts, backend, frontend, usuarios de prueba) · 15) Conclusiones y aporte de cada integrante.

**Flujo de demo sugerido:** login ADMIN → crear libro y ejemplar → login BIBLIOTECARIO → registrar préstamo → intentar préstamo inválido (validación) → devolución tardía → login ESTUDIANTE → ver solo su historial y comprobar que no accede a administración → login ADMIN → bitácora → reportes y exportación.

---

### FASE 9 — Revisión final y entrega

| # | Paso | Resp. | Criterio de aceptación |
|---|------|-------|------------------------|
| 9.1 | En una **máquina limpia** (o con `db-reset`): `docker compose up`, `db-install`, backend y frontend siguiendo solo el README | 👤🤝 | Funciona sin pasos ocultos |
| 9.2 | Ejecutar `db-test` y `./mvnw test` | 🤝 | Todo verde |
| 9.3 | Recorrer funcionalidades 1, 2, 3, 4, 6, 7 con cada rol | 👤 | Todas funcionan |
| 9.4 | Verificar consistencia ER ↔ scripts ↔ entidades JPA ↔ diccionario ↔ documentación | 🤖 | Sin diferencias |
| 9.5 | Preparar la carpeta de entrega en la nube: copia del repo (zip o enlace al repositorio con acceso), ER, scripts SQL, documento, presentación, video, reportes | 👤 | Checklist completo |
| 9.6 | Link configurado como "cualquiera con el enlace puede ver"; probado en ventana de incógnito | 👤 | Se abre sin iniciar sesión |
| 9.7 | Subir el link al portal **antes del viernes 30/10/2026 11:59**; guardar captura del comprobante | 👤 | Comprobante guardado |
| 9.8 | Cada integrante repasa el proyecto completo (evaluación individual) | 👤 | Todos pueden explicar ER, reglas, API, app y demo |

---

## 7. CRITERIOS DE ACEPTACIÓN GLOBALES (Definition of Done)

- [ ] El ER cubre todas las funcionalidades del enunciado y está en 3FN.
- [ ] El esquema Oracle es idéntico al ER, al diccionario y a las entidades JPA.
- [ ] `db-reset` + `db-install` reconstruyen la BD completa sin errores en cualquier computadora.
- [ ] Préstamos y devoluciones respetan RN1–RN10 (validadas en Oracle).
- [ ] La bitácora registra las operaciones críticas con el usuario real de la aplicación.
- [ ] La app hace CRUD sobre usuarios, libros, ejemplares, catálogos, préstamos y devoluciones.
- [ ] Cada rol ve y puede hacer únicamente lo que le corresponde (verificado también por URL directa y por API → 403).
- [ ] Hay ≥3 reportes con gráficas y exportación.
- [ ] Documentación, presentación y video completos; nada impreso.
- [ ] Link en la nube accesible y entregado a tiempo.

---

## 8. REPARTO DE RESPONSABILIDADES (completar)

| Integrante | Módulo principal | Apoyo secundario |
|------------|------------------|------------------|
| 1 — Líder/integrador | Fase 0 y 9, repositorio, entrega del link | Revisión general |
| 2 — Datos | Fase 1 (ER, diccionario) y Fase 2 | Documentación |
| 3 — Base de datos | Fases 2, 3 y 7.1 (PL/SQL, vistas) | Backend |
| 4 — Backend | Fases 4 y 5 (API, seguridad) | Pruebas |
| 5 — Frontend | Fases 6 y 7.3 (Angular, reportes) | Presentación y documentación |

> Todos deben tocar BD y app, y poder defender el proyecto completo.

---

## 9. INSTRUCCIONES PARA CLAUDE CODE

1. Lee este archivo completo **y `PROGRESO.md`** al inicio de cada sesión (después de ejecutar `git pull`). Registra el avance en `PROGRESO.md` siguiendo el protocolo de seguimiento de más abajo, usando solo `git pull` y `git add` (**nunca commit ni push**).
2. Trabaja **de forma autónoma**, en el orden del plan: termina y prueba cada paso, regístralo en `PROGRESO.md`, hazle `git add` y **continúa con el siguiente sin esperar confirmación**. Solo detente y pregunta cuando (a) tengas una duda real (ver punto 4) o (b) el siguiente paso requiera una acción manual de la persona (👤: decisiones del equipo, Data Modeler, capturas, validación visual, commit/push). Al detenerte, resume lo hecho, lo probado y lo que la persona debe hacer.
3. No cambies el modelo (sección 5) después de congelarlo en el paso 1.6 sin avisar y sin actualizar a la vez ER, SQL, entidades JPA y diccionario.
4. **Si tienes dudas, pregunta** antes de escribir código: requisitos poco claros, decisiones de diseño con más de una opción razonable, algo que contradiga este plan o el estado del repo. Haz las preguntas de forma concreta (con opciones y tu recomendación) y espera la respuesta; no asumas.
4b. **Sin comentarios en el código** (salvo la cabecera corta de cada script SQL) y **código simple** (ver sección 4). No agregues funcionalidades, capas ni dependencias que el plan no pida.
4c. **Git: `git pull` al iniciar la sesión y `git add` al terminar cada paso.** Nunca `commit`, `push`, `merge`, `rebase` ni `reset`. La persona revisa el staging y hace el commit y el push.
5. Puedes ejecutar los scripts directamente contra el contenedor Docker (`scripts/db-*`); **prueba todo lo que generes** y reporta el resultado real. Si algo no se pudo probar, dilo explícitamente.
6. Los scripts SQL deben ser ejecutables en Oracle XE 21c y en Oracle Free 23ai/26ai (no usar sintaxis exclusiva de 23ai como `IF EXISTS` o el tipo `BOOLEAN` en SQL); valida la sintaxis (PL/SQL con `/`, `SHOW ERRORS`).
7. Toda la lógica de negocio crítica vive en `PKG_BIBLIOTECA`; el backend no la duplica, la invoca.
8. Nada de credenciales reales en el repo; usa `.env`.
9. Mantén `README.md` y `docs/documentacion_final.md` actualizados conforme avanzas.
10. Prioridad si hay presión de tiempo: **ER (8) → tablas + préstamo/devolución en PL/SQL → API + CRUD Angular (3) → login/roles (1) → reportes (1) → bitácora, documentación y presentación**.

### Protocolo de seguimiento (`PROGRESO.md`)

**Objetivo:** que todo el equipo, desde su propia máquina, sepa en cualquier momento qué está hecho, qué está en curso, quién lo hace y qué sigue.

**Al iniciar una sesión (Claude Code lo hace siempre, sin que se lo pidan):**
1. Ejecutar `git pull` para traer los últimos cambios (es lo primero que se hace). Si hay conflictos o cambios locales sin guardar que lo impidan, detenerse, explicar y preguntar.
2. Leer `PROGRESO.md` y dar un resumen de 3–5 líneas: fase actual, qué se completó desde la última vez, qué está en curso (y de quién) y qué pasos están disponibles.
3. Verificar que el entorno local siga funcionando si hubo cambios de esquema o de `.env.example` (reinstalar la BD con `scripts/db-reset` + `db-install` cuando corresponda).
4. Proponer el siguiente paso **que no esté tomado por otra persona** y, antes de empezar, **reclamarlo**: poner el estado 🟡, el nombre del responsable y la fecha, y dejar `PROGRESO.md` en staging (`git add`); pedir a la persona que haga commit y push de inmediato (así nadie más lo toma).

**Al terminar un paso (o al pausar a mitad de camino):**
1. Marcar el estado: ✅ hecho, 🟡 en curso (con nota de qué falta) o ⛔ bloqueado (con el motivo).
2. Escribir una nota breve: qué se generó, dónde está (rutas) y cómo se probó. Si algo no se pudo probar, decirlo.
3. Agregar una entrada al **Registro de sesiones** (la más reciente arriba) con fecha, persona y resumen.
4. Actualizar la sección **Siguiente paso recomendado**.
5. Si el cambio **afecta a los demás** (esquema de BD, endpoints de la API, variables del `.env`, dependencias nuevas), anotarlo en **Cambios que afectan a todos**, indicando qué debe hacer cada quien (por ejemplo: "ejecutar `scripts/db-reset` y `scripts/db-install`").
6. Hacer `git add` de los archivos del paso (incluido `PROGRESO.md`) **sin commit ni push**, mostrar el resumen (`git status` y `git diff --staged --stat`) y proponer el mensaje de commit con formato `[paso X.Y] ...`. La persona revisa, hace commit y push. Tras un cambio de esquema o de API, pedir que el push se haga **de inmediato** para que el resto no trabaje sobre algo desactualizado.

**Reglas para evitar conflictos:**
- Un solo responsable por paso; se reclama antes de empezar.
- Una fila por paso en la tabla; no reordenar ni reformatear filas ajenas.
- Si hay conflicto de merge en `PROGRESO.md`, conservar **ambos** cambios (es una bitácora, no se descarta nada).
- No marcar ✅ algo que no se haya probado; si solo está generado, dejarlo 🟡 con la nota "falta probar".
- Si cambia el alcance del plan (se agrega o quita un paso), reflejarlo en `CLAUDE.md` y en la tabla de `PROGRESO.md` en el mismo commit.

**Plantilla de `PROGRESO.md`:**

```markdown
# PROGRESO DEL PROYECTO — Biblioteca Universitaria

**Última actualización:** AAAA-MM-DD HH:MM · por <nombre>
**Fase actual:** <número y nombre>
**Fecha límite de entrega:** viernes 30/10/2026, 11:59

## Estado de un vistazo
| Fase | Pasos | Hechos | En curso | Pendientes |
|------|-------|--------|----------|------------|
| 0 Repositorio y entorno | 8 | 0 | 0 | 8 |
| ... (una fila por fase) | | | | |

## Siguiente paso recomendado
<paso, quién lo puede tomar, qué necesita antes>

## Cambios que afectan a todos (leer tras cada git pull)
| Fecha | Cambio | Qué debe hacer cada integrante |
|-------|--------|--------------------------------|

## Tabla de tareas
Estados: ⬜ pendiente · 🟡 en curso · ✅ hecho · ⛔ bloqueado
| Paso | Descripción | Responsable | Estado | Fecha | Notas / rutas / cómo se probó |
|------|-------------|-------------|--------|-------|-------------------------------|
| 0.1 | Crear repo remoto y clonar | | ⬜ | | |
| ... (todos los pasos del plan) | | | | | |

## Bloqueos y decisiones abiertas
| Fecha | Tema | Quién decide | Estado |
|-------|------|--------------|--------|

## Registro de sesiones (más reciente arriba)
### AAAA-MM-DD · <nombre>
- Hecho: ...
- Pendiente / siguiente: ...
- Notas: ...
```

### Prompt inicial sugerido

```
Lee @CLAUDE.md completo y, si existe, @PROGRESO.md (haz git pull antes). Resúmeme el estado y qué
paso sigue; reclámalo en PROGRESO.md antes de empezar. Vamos a ejecutar el plan paso a paso: no avances al siguiente paso hasta que yo
confirme el actual, haz git pull al empezar y solo git add al terminar (nunca commit ni push), no escribas comentarios en el código (solo una cabecera corta en cada script SQL)
y pregúntame cualquier duda antes de asumir.
Empecemos con la Fase 0: crea la estructura de carpetas, el .gitignore, el docker-compose.yml
con Oracle XE y los scripts de scripts/ (versión .sh y .ps1). Verifica en la documentación de la
imagen gvenzl/oracle-xe el tag y las variables correctas, levanta el contenedor y comprueba la
conexión con un SELECT. Al terminar cada paso, muéstrame el resultado y espera mi confirmación antes de continuar.
```
