# Guía: generar el ER oficial con Oracle SQL Developer Data Modeler (pasos 2.9–2.12)

## 0. Requisitos
- Oracle SQL Developer Data Modeler: https://www.oracle.com/database/sqldeveloper/technologies/sql-data-modeler/download/ (o el Data Modeler que trae SQL Developer: *View → Data Modeler*).
- La BD instalada: `./scripts/db-up.sh` y luego `./scripts/db-install.sh`.
- Datos de conexión: los del `.env` de tu máquina (`DB_PORT`, `DB_SERVICE`, `APP_USER`, `APP_USER_PASSWORD`).

## 1. Importar el diccionario de datos (2.9)
1. *File → Import → Data Dictionary*.
2. *Add* una conexión nueva:
   - Nombre: `biblioteca`
   - Usuario: `BIBLIOTECA`; contraseña: la de `APP_USER_PASSWORD`
   - Host: `localhost`; puerto: `1521`
   - **Service name**: `XEPDB1` si usas Oracle XE, o `FREEPDB1` si usas Oracle Free 23ai/26ai
   - *Test* → *Success* → *OK*.
3. Selecciona la conexión → *Next* → marca el esquema **BIBLIOTECA** → *Next*.
4. En la pestaña *Tables* marca las **11 tablas**: AUTOR, BITACORA, CATEGORIA, DEVOLUCION, EDITORIAL, EJEMPLAR, LIBRO, LIBRO_AUTOR, PRESTAMO, ROL, USUARIO. Opcional: en *Views* marca las 7 `VW_*` (no son parte del ER).
5. *Next* → *Finish*. Aparece el **modelo relacional** con las tablas y las FK.

## 2. Modelo lógico (2.10)
1. Clic derecho sobre el modelo relacional en el navegador → **Engineer to Logical Model** → *Engineer*.
2. En el modelo lógico, renombra cada relación (doble clic sobre la línea → *Name*):

| Relación (FK) | Nombre sugerido |
|---------------|-----------------|
| FK_USUARIO_ROL | ROL asigna USUARIO |
| FK_LIBRO_EDITORIAL | EDITORIAL publica LIBRO |
| FK_LIBRO_CATEGORIA | CATEGORIA clasifica LIBRO |
| FK_LIBRO_AUTOR_LIBRO / _AUTOR | LIBRO tiene AUTOR (N:M) |
| FK_EJEMPLAR_LIBRO | LIBRO tiene EJEMPLAR |
| FK_PRESTAMO_USUARIO | USUARIO solicita PRESTAMO |
| FK_PRESTAMO_BIBLIOTECARIO | USUARIO registra PRESTAMO |
| FK_PRESTAMO_EJEMPLAR | EJEMPLAR se presta en PRESTAMO |
| FK_DEVOLUCION_PRESTAMO | PRESTAMO se cierra con DEVOLUCION (1:0..1) |
| FK_DEVOLUCION_BIBLIOTECARIO | USUARIO recibe DEVOLUCION |

3. Verifica las cardinalidades contra `modelo/diccionario_datos.md` (sección Relaciones). La de PRESTAMO–DEVOLUCION debe ser **1:0..1**: al ser `ID_PRESTAMO` UNIQUE, Data Modeler la reconoce como 1:1. Marca en DEVOLUCION el lado opcional si no aparece así.

## 3. Ordenar los diagramas (2.11)
1. *Tools → Preferences → Data Modeler → Diagram → Logical Model* → **Notation: Barker** o **Information Engineering** (pie de gallo). Barker también usa pie de gallo.
2. Clic derecho en el fondo del diagrama → *Auto Layout*; luego acomoda a mano: catálogos (ROL, EDITORIAL, CATEGORIA, AUTOR) arriba; LIBRO, EJEMPLAR, USUARIO al centro; PRESTAMO y DEVOLUCION abajo; BITACORA aparte (no tiene FK).
3. En el relacional: clic derecho → *View Details → All* para ver PK/FK y tipos.

## 4. Guardar y exportar (2.12)
1. *File → Save As* → `modelo/biblioteca.dmd` (se crea también la carpeta `modelo/biblioteca/`, que hay que subir al repo).
2. Con cada diagrama abierto: *File → Print Diagram → To PDF File* → `modelo/er_logico.pdf` y `modelo/er.pdf` (relacional); *To Image File* → `modelo/er.png`.
3. Sube los archivos también a la carpeta en la nube (subcarpeta *Modelo*).
