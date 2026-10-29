# PROGRESO DEL PROYECTO — Biblioteca Universitaria

**Última actualización:** 2026-10-28 23:30 · por G_PROYECTO_FINAL 3
**Fase actual:** 4 Backend (BD terminada: Fases 2, 3 y 7.1)
**Fecha límite de entrega:** viernes 30/10/2026, 11:59

## Estado de un vistazo
| Fase | Pasos | Hechos | En curso | Pendientes |
|------|-------|--------|----------|------------|
| 0 Repositorio y entorno | 10 | 6 | 2 | 2 |
| 1 Diseño del modelo | 6 | 2 | 2 | 2 |
| 2 Base de datos Oracle | 13 | 8 | 0 | 5 |
| 3 PL/SQL y bitácora | 5 | 5 | 0 | 0 |
| 4 Backend Spring Boot | 10 | 0 | 0 | 10 |
| 5 Seguridad y roles | 7 | 0 | 0 | 7 |
| 6 Frontend Angular | 9 | 0 | 0 | 9 |
| 7 Reportes | 5 | 1 | 0 | 4 |
| 8 Documentación y presentación | 6 | 0 | 0 | 6 |
| 9 Revisión final y entrega | 8 | 0 | 0 | 8 |

## Siguiente paso recomendado
- 🤖 **4.1 en adelante (backend Spring Boot)**: lo sigue Claude Code.
- 👤 **2.9–2.12 (ER oficial en Data Modeler, 8 pts)**: cualquier integrante, en paralelo, siguiendo `modelo/guia_data_modeler.md`. Requiere la BD instalada (`db-up` + `db-create-user` + `db-install`).
- 👤 1.1/1.6: el equipo revisa los ajustes del modelo (nota de 1.1) y lo aprueba.
- 👤 0.5/2.13: probar en una segunda computadora (con Windows, para validar también los `.ps1`).

## Cambios que afectan a todos (leer tras cada git pull)
| Fecha | Cambio | Qué debe hacer cada integrante |
|-------|--------|--------------------------------|
| 2026-10-28 | Nuevos `.env.example` y scripts `scripts/db-*`; esquema completo en `db/` | Copiar `.env.example` a `.env` con los datos de tu contenedor Oracle; ejecutar `db-up`, `db-create-user` y `db-install` (ver README) |

## Tabla de tareas
Estados: ⬜ pendiente · 🟡 en curso · ✅ hecho · ⛔ bloqueado
| Paso | Descripción | Responsable | Estado | Fecha | Notas / rutas / cómo se probó |
|------|-------------|-------------|--------|-------|-------------------------------|
| 0.1 | Crear repo remoto y clonar | G_PROYECTO_FINAL 3 | ✅ | 2026-10-28 | github.com/AndresEAY/ProyectoFinal_BD1 |
| 0.2 | Estructura de carpetas, .gitignore, CLAUDE.md | G_PROYECTO_FINAL 3 | ✅ | 2026-10-28 | Carpetas con .gitkeep |
| 0.2a | Crear PROGRESO.md con todos los pasos | G_PROYECTO_FINAL 3 | ✅ | 2026-10-28 | Tabla con los 79 pasos del plan |
| 0.2b | Detectar contenedor Oracle existente y generar .env local | G_PROYECTO_FINAL 3 | ✅ | 2026-10-28 | Se reutiliza `analisis-oracle` (gvenzl/oracle-free:23-slim, Oracle 26ai Free, PDB FREEPDB1). `.env` local generado |
| 0.2c | Script db-create-user (idempotente) | G_PROYECTO_FINAL 3 | ✅ | 2026-10-28 | `scripts/db-create-user.sh/.ps1`; ejecutado 2 veces sin error (crea / ya existe) |
| 0.3 | docker-compose.yml opcional, .env.example, scripts db-* (.sh y .ps1) | G_PROYECTO_FINAL 3 | 🟡 | 2026-10-28 | `.sh` probados contra analisis-oracle. **Falta probar** los `.ps1` (no hay PowerShell en esta Mac) y `docker compose up` (aquí ya existía contenedor). `db-reset` borra solo el esquema APP_USER, no el volumen, porque el contenedor se comparte |
| 0.4 | README.md de instalación | G_PROYECTO_FINAL 3 | ✅ | 2026-10-28 | README.md con prerrequisitos, `.env`, tabla de scripts .sh/.ps1 |
| 0.5 | Probar conexión con SELECT 'OK' FROM dual | G_PROYECTO_FINAL 3 | 🟡 | 2026-10-28 | SELECT OK como SYSTEM y como BIBLIOTECA en esta máquina. Falta una 2.ª computadora |
| 0.6 | Repartir módulos (sección 8) | | ⬜ | | 👤 |
| 0.7 | Carpeta en la nube con subcarpetas | | ⬜ | | 👤 |
| 1.1 | Revisar modelo de referencia y proponer ajustes | G_PROYECTO_FINAL 3 | 🟡 | 2026-10-28 | Ajustes al modelo de la sección 5: EJEMPLAR.ESTADO admite INACTIVO (RN10); índice único de préstamo abierto por ejemplar; CK_DEVOLUCION_COHERENCIA; SP_REGISTRAR_DEVOLUCION devuelve OUT p_id_devolucion; préstamo rechaza libros inactivos (-20008). Falta aprobación del equipo |
| 1.2 | Borrador ER en Mermaid (modelo/er.mmd) | G_PROYECTO_FINAL 3 | 🟡 | 2026-10-28 | `modelo/er.mmd` (11 entidades). Falta verificar que renderiza (p. ej. mermaid.live) |
| 1.3 | ER oficial (diferido a 2.9–2.12) | | ⬜ | | |
| 1.4 | Verificar normalización 3FN | G_PROYECTO_FINAL 3 | ✅ | 2026-10-28 | Sección Normalización en `modelo/diccionario_datos.md`. A_TIEMPO documentado como desnormalización controlada |
| 1.5 | Diccionario de datos | G_PROYECTO_FINAL 3 | ✅ | 2026-10-28 | `modelo/diccionario_datos.md`, 100 % de columnas; verificado contra USER_TAB_COLUMNS |
| 1.6 | Congelar el modelo | | ⬜ | | 👤 |
| 2.1 | 00_drop_all.sql | G_PROYECTO_FINAL 3 | ✅ | 2026-10-28 | Probado sobre BD vacía (tras db-reset) y llena (db-install repetido) |
| 2.2 | 01_tablas.sql | G_PROYECTO_FINAL 3 | ✅ | 2026-10-28 | 11 tablas creadas |
| 2.3 | 02_constraints_indices.sql | G_PROYECTO_FINAL 3 | ✅ | 2026-10-28 | CHECKs rechazan valores inválidos (ORA-02290 probado en EJEMPLAR, USUARIO, DEVOLUCION) |
| 2.4 | 03_datos_catalogos.sql | G_PROYECTO_FINAL 3 | ✅ | 2026-10-28 | 4 roles, 6 categorías, 6 editoriales, 21 autores |
| 2.5 | 04_datos_prueba.sql | G_PROYECTO_FINAL 3 | ✅ | 2026-10-28 | 12 usuarios, 21 libros, 25 libro-autor, 48 ejemplares, 18 préstamos (6 activos, 2 vencidos, 10 devueltos: 6 a tiempo, 4 tarde), 10 devoluciones |
| 2.6 | install_all.sql y db/README.md | G_PROYECTO_FINAL 3 | ✅ | 2026-10-28 | `db/install_all.sql` + `db/README.md` |
| 2.7 | Probar db-reset + db-install desde cero | G_PROYECTO_FINAL 3 | ✅ | 2026-10-28 | db-reset + db-install sin errores, conteos correctos |
| 2.8 | Verificar esquema real vs diccionario | G_PROYECTO_FINAL 3 | ✅ | 2026-10-28 | USER_TAB_COLUMNS y USER_CONSTRAINTS coinciden con el diccionario (11 PK, 11 FK, 9 UK, 15 CK) |
| 2.9 | Importar BD en SQL Developer Data Modeler | | ⬜ | | 👤 |
| 2.10 | Generar modelo lógico | | ⬜ | | 👤 |
| 2.11 | Acomodar diagramas (pie de gallo) | | ⬜ | | 👤 |
| 2.12 | Guardar .dmd y exportar er.pdf / er.png | | ⬜ | | 👤 |
| 2.13 | Validar en una segunda computadora | | ⬜ | | 👤 |
| 3.1 | Triggers de bitácora | G_PROYECTO_FINAL 3 | ✅ | 2026-10-28 | `db/05_bitacora_triggers.sql`; JSON en DATOS_ANTERIORES/NUEVOS (sin PASSWORD_HASH) |
| 3.2 | Paquete PKG_BIBLIOTECA | G_PROYECTO_FINAL 3 | ✅ | 2026-10-28 | `db/06_paquete_biblioteca.sql`, paquete VALID, SHOW ERRORS vacío |
| 3.3 | Códigos de error documentados | G_PROYECTO_FINAL 3 | ✅ | 2026-10-28 | `docs/codigos_error.md` (-20001..-20012) |
| 3.4 | 99_pruebas.sql | G_PROYECTO_FINAL 3 | ✅ | 2026-10-28 | `db/99_pruebas.sql`, 26 casos, resultados esperados en `db/README.md` |
| 3.5 | Ejecutar reset/install/test y corregir | G_PROYECTO_FINAL 3 | ✅ | 2026-10-28 | db-reset + db-install + db-test: 26 OK, 0 FALLO |
| 4.1 | Proyecto Spring Boot | | ⬜ | | |
| 4.2 | Entidades JPA | | ⬜ | | |
| 4.3 | CRUD de catálogos, usuarios, libros, ejemplares | | ⬜ | | |
| 4.4 | Endpoints de préstamos y devoluciones | | ⬜ | | |
| 4.5 | Endpoint mi historial | | ⬜ | | |
| 4.6 | Endpoint bitácora | | ⬜ | | |
| 4.7 | CLIENT_IDENTIFIER por operación | | ⬜ | | |
| 4.8 | Manejo global de excepciones | | ⬜ | | |
| 4.9 | Swagger y docs/api.md | | ⬜ | | |
| 4.10 | Pruebas backend | | ⬜ | | |
| 5.1 | 08_seguridad_datos.sql | | ⬜ | | |
| 5.2 | Login JWT | | ⬜ | | |
| 5.3 | Autorización por rol | | ⬜ | | |
| 5.4 | CORS | | ⬜ | | |
| 5.5 | Frontend: interceptor, guards, menú por rol | | ⬜ | | |
| 5.6 | Probar cada rol y capturas | | ⬜ | | 👤 |
| 5.7 | (Opcional) Roles de BD | | ⬜ | | |
| 6.1 | Proyecto Angular | | ⬜ | | |
| 6.2 | core y shared | | ⬜ | | |
| 6.3 | Pantallas CRUD | | ⬜ | | |
| 6.4 | Nuevo préstamo | | ⬜ | | |
| 6.5 | Devolución | | ⬜ | | |
| 6.6 | Mi historial | | ⬜ | | |
| 6.7 | Bitácora | | ⬜ | | |
| 6.8 | Dashboard | | ⬜ | | |
| 6.9 | Pulir UX | | ⬜ | | |
| 7.1 | 07_vistas_reportes.sql | G_PROYECTO_FINAL 3 | ✅ | 2026-10-28 | `db/07_vistas_reportes.sql`, 7 vistas con datos |
| 7.2 | Endpoints de reportes y exportación | | ⬜ | | |
| 7.3 | Pantalla Reportes con gráficas | | ⬜ | | |
| 7.4 | (Opcional) Power BI/Excel | | ⬜ | | |
| 7.5 | Capturas de reportes | | ⬜ | | 👤 |
| 8.1 | docs/documentacion_final.md | | ⬜ | | |
| 8.2 | Exportar a Word/PDF | | ⬜ | | |
| 8.3 | Guion de demo | | ⬜ | | |
| 8.4 | Presentación | | ⬜ | | |
| 8.5 | Video de demo | | ⬜ | | 👤 |
| 8.6 | Ensayo completo | | ⬜ | | 👤 |
| 9.1 | Prueba en máquina limpia | | ⬜ | | 👤 |
| 9.2 | db-test y mvnw test | | ⬜ | | |
| 9.3 | Recorrer funcionalidades con cada rol | | ⬜ | | 👤 |
| 9.4 | Consistencia ER ↔ scripts ↔ JPA ↔ docs | | ⬜ | | |
| 9.5 | Carpeta de entrega en la nube | | ⬜ | | 👤 |
| 9.6 | Link público probado en incógnito | | ⬜ | | 👤 |
| 9.7 | Subir link al portal | | ⬜ | | 👤 |
| 9.8 | Repaso individual | | ⬜ | | 👤 |

## Bloqueos y decisiones abiertas
| Fecha | Tema | Quién decide | Estado |
|-------|------|--------------|--------|

## Registro de sesiones (más reciente arriba)
### 2026-10-28 · G_PROYECTO_FINAL 3
- Hecho: Fase 0 (salvo 0.6, 0.7 y pruebas en otra máquina), Fase 1 en texto (borrador ER, diccionario, 3FN), Fase 2 automática (2.1–2.8), Fase 3 completa (bitácora, PKG_BIBLIOTECA, 26 pruebas OK) y vistas 7.1.
- Pendiente / siguiente: backend (Fase 4); ER oficial en Data Modeler (2.9–2.12, manual).
- Notas: CLAUDE.md ahora indica trabajo autónomo (solo se pregunta ante dudas o pasos manuales). Se reutiliza el contenedor `analisis-oracle` (Oracle 26ai Free, FREEPDB1).
