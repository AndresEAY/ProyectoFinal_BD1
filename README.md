# Biblioteca Universitaria — Proyecto Final Base de Datos I

Sistema de biblioteca: Oracle (Docker) + Spring Boot + Angular. El plan completo está en `CLAUDE.md` y el avance en `PROGRESO.md`.

## Prerrequisitos

| Herramienta | Versión | Notas |
|-------------|---------|-------|
| Docker Desktop | reciente | ≈2 GB de RAM libres para Oracle |
| Git | reciente | |
| JDK | 21 (o 17) | backend |
| Node.js | 20+ | frontend (Angular CLI vía `npx`) |

En Windows usar los scripts `.ps1` (PowerShell); en macOS/Linux los `.sh`.

## De cero a funcionando

### 1. Clonar
```bash
git clone https://github.com/AndresEAY/ProyectoFinal_BD1.git
cd ProyectoFinal_BD1
```

### 2. Configurar `.env`
Copiar `.env.example` a `.env` y ajustarlo a tu máquina. **`.env` no se sube a Git.**

| Variable | Significado |
|----------|-------------|
| `DB_CONTAINER` | Nombre del contenedor Oracle |
| `DB_IMAGE` | Imagen (solo si se crea con `docker compose`) |
| `DB_PORT` | Puerto del host mapeado al 1521 del contenedor |
| `DB_SERVICE` | PDB: `XEPDB1` (Oracle XE 21) o `FREEPDB1` (Oracle Free 23ai/26ai) |
| `DB_SYSTEM_PASSWORD` | Contraseña de `SYSTEM` |
| `APP_USER` / `APP_USER_PASSWORD` | Esquema de la aplicación (`BIBLIOTECA`) |

**Si ya tienes un contenedor Oracle**, no crees otro: pon su nombre en `DB_CONTAINER`, su contraseña de SYSTEM y su PDB. Para descubrirlos:
```bash
docker ps -a
docker inspect <contenedor> --format '{{json .Config.Env}}'
```

**Si no tienes ninguno**, `db-up` lo crea con `docker-compose.yml`:
- PC Intel/AMD: `DB_IMAGE=gvenzl/oracle-xe:21-slim-faststart`, `DB_SERVICE=XEPDB1`
- Mac Apple Silicon (ARM): `DB_IMAGE=gvenzl/oracle-free:23-slim`, `DB_SERVICE=FREEPDB1`

### 3. Base de datos
| Paso | macOS/Linux | Windows |
|------|-------------|---------|
| Levantar Oracle y esperar a que esté listo | `./scripts/db-up.sh` | `.\scripts\db-up.ps1` |
| Crear el usuario de la app (idempotente) | `./scripts/db-create-user.sh` | `.\scripts\db-create-user.ps1` |
| Instalar tablas, datos, PL/SQL y vistas | `./scripts/db-install.sh` | `.\scripts\db-install.ps1` |
| Reinstalar desde cero (borra y recrea el esquema `APP_USER`) | `./scripts/db-reset.sh` | `.\scripts\db-reset.ps1` |
| Ejecutar las pruebas de la BD | `./scripts/db-test.sh` | `.\scripts\db-test.ps1` |
| Abrir SQL*Plus como usuario de la app (`--system` / `-System` para SYSTEM) | `./scripts/db-sql.sh` | `.\scripts\db-sql.ps1` |

`db-reset` solo elimina el esquema de la aplicación, no el contenedor ni otros esquemas que tenga.

Comprobar la conexión: `./scripts/db-sql.sh` y luego `SELECT 'OK' FROM dual;`

Conexión JDBC: `jdbc:oracle:thin:@//localhost:${DB_PORT}/${DB_SERVICE}`

### 4. Backend (Spring Boot 4, Java 21)
```bash
cd backend
./mvnw spring-boot:run        # Windows: mvnw.cmd spring-boot:run
```
Lee la conexión del `.env` de la raíz (`DB_PORT`, `DB_SERVICE`, `APP_USER`, `APP_USER_PASSWORD`, `JWT_SECRET`). Queda en `http://localhost:8080`; Swagger en `http://localhost:8080/swagger-ui.html`. Contrato de la API en `docs/api.md`.

Pruebas: `./mvnw test` (requieren la BD instalada; no dejan cambios).

### 5. Frontend (Angular 22 + Angular Material)
```bash
cd frontend
npm install
npx ng serve
```
Abrir `http://localhost:4200` (el backend debe estar corriendo en el puerto 8080). La URL de la API está en `frontend/src/environments/environment.ts`.

Orden para levantar todo: `db-up` → `db-install` (solo la primera vez o tras cambios de BD) → backend → frontend.

## Usuarios de prueba
Contraseña de todos: **`Biblio2026`** (no confundir con `APP_USER_PASSWORD`, que es la del esquema Oracle).

| Rol | Usuarios |
|-----|----------|
| ADMIN | `admin`, `admin2` |
| BIBLIOTECARIO | `biblio1`, `biblio2` |
| PROFESOR | `profesor1`, `profesor2`, `profesor3` |
| ESTUDIANTE | `estudiante1` … `estudiante4` (`estudiante5` está inactivo) |

Detalle de la situación de cada uno para la demo en `db/README.md`.
