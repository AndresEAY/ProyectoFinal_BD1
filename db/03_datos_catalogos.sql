-- Carga los catálogos: roles con sus reglas de préstamo, categorías, editoriales y autores.
INSERT INTO ROL (NOMBRE, DESCRIPCION, DIAS_PRESTAMO, MAX_PRESTAMOS) VALUES ('ADMIN', 'Administrador del sistema', 15, 5);
INSERT INTO ROL (NOMBRE, DESCRIPCION, DIAS_PRESTAMO, MAX_PRESTAMOS) VALUES ('BIBLIOTECARIO', 'Personal de biblioteca', 15, 5);
INSERT INTO ROL (NOMBRE, DESCRIPCION, DIAS_PRESTAMO, MAX_PRESTAMOS) VALUES ('PROFESOR', 'Docente de la universidad', 15, 5);
INSERT INTO ROL (NOMBRE, DESCRIPCION, DIAS_PRESTAMO, MAX_PRESTAMOS) VALUES ('ESTUDIANTE', 'Estudiante de la universidad', 7, 3);

INSERT INTO CATEGORIA (NOMBRE, DESCRIPCION) VALUES ('Bases de Datos', 'Diseño, SQL y administración de bases de datos');
INSERT INTO CATEGORIA (NOMBRE, DESCRIPCION) VALUES ('Programación', 'Lenguajes y técnicas de programación');
INSERT INTO CATEGORIA (NOMBRE, DESCRIPCION) VALUES ('Matemáticas', 'Cálculo, álgebra y matemática discreta');
INSERT INTO CATEGORIA (NOMBRE, DESCRIPCION) VALUES ('Redes', 'Redes de computadoras y telecomunicaciones');
INSERT INTO CATEGORIA (NOMBRE, DESCRIPCION) VALUES ('Ingeniería de Software', 'Análisis, diseño y gestión de proyectos de software');
INSERT INTO CATEGORIA (NOMBRE, DESCRIPCION) VALUES ('Literatura', 'Novela, cuento y poesía');

INSERT INTO EDITORIAL (NOMBRE, PAIS) VALUES ('Pearson', 'Reino Unido');
INSERT INTO EDITORIAL (NOMBRE, PAIS) VALUES ('McGraw-Hill', 'Estados Unidos');
INSERT INTO EDITORIAL (NOMBRE, PAIS) VALUES ('O''Reilly Media', 'Estados Unidos');
INSERT INTO EDITORIAL (NOMBRE, PAIS) VALUES ('Addison-Wesley', 'Estados Unidos');
INSERT INTO EDITORIAL (NOMBRE, PAIS) VALUES ('Cengage Learning', 'Estados Unidos');
INSERT INTO EDITORIAL (NOMBRE, PAIS) VALUES ('Penguin Random House', 'España');

INSERT INTO AUTOR (NOMBRES, APELLIDOS, NACIONALIDAD) VALUES ('Abraham', 'Silberschatz', 'Estados Unidos');
INSERT INTO AUTOR (NOMBRES, APELLIDOS, NACIONALIDAD) VALUES ('Henry', 'Korth', 'Estados Unidos');
INSERT INTO AUTOR (NOMBRES, APELLIDOS, NACIONALIDAD) VALUES ('Ramez', 'Elmasri', 'Estados Unidos');
INSERT INTO AUTOR (NOMBRES, APELLIDOS, NACIONALIDAD) VALUES ('Shamkant', 'Navathe', 'India');
INSERT INTO AUTOR (NOMBRES, APELLIDOS, NACIONALIDAD) VALUES ('Joshua', 'Bloch', 'Estados Unidos');
INSERT INTO AUTOR (NOMBRES, APELLIDOS, NACIONALIDAD) VALUES ('Robert', 'Martin', 'Estados Unidos');
INSERT INTO AUTOR (NOMBRES, APELLIDOS, NACIONALIDAD) VALUES ('Martin', 'Fowler', 'Reino Unido');
INSERT INTO AUTOR (NOMBRES, APELLIDOS, NACIONALIDAD) VALUES ('James', 'Stewart', 'Canadá');
INSERT INTO AUTOR (NOMBRES, APELLIDOS, NACIONALIDAD) VALUES ('Kenneth', 'Rosen', 'Estados Unidos');
INSERT INTO AUTOR (NOMBRES, APELLIDOS, NACIONALIDAD) VALUES ('Andrew', 'Tanenbaum', 'Países Bajos');
INSERT INTO AUTOR (NOMBRES, APELLIDOS, NACIONALIDAD) VALUES ('James', 'Kurose', 'Estados Unidos');
INSERT INTO AUTOR (NOMBRES, APELLIDOS, NACIONALIDAD) VALUES ('Keith', 'Ross', 'Estados Unidos');
INSERT INTO AUTOR (NOMBRES, APELLIDOS, NACIONALIDAD) VALUES ('Ian', 'Sommerville', 'Reino Unido');
INSERT INTO AUTOR (NOMBRES, APELLIDOS, NACIONALIDAD) VALUES ('Roger', 'Pressman', 'Estados Unidos');
INSERT INTO AUTOR (NOMBRES, APELLIDOS, NACIONALIDAD) VALUES ('Gabriel', 'García Márquez', 'Colombia');
INSERT INTO AUTOR (NOMBRES, APELLIDOS, NACIONALIDAD) VALUES ('Miguel Ángel', 'Asturias', 'Guatemala');
INSERT INTO AUTOR (NOMBRES, APELLIDOS, NACIONALIDAD) VALUES ('Brian', 'Kernighan', 'Canadá');
INSERT INTO AUTOR (NOMBRES, APELLIDOS, NACIONALIDAD) VALUES ('Dennis', 'Ritchie', 'Estados Unidos');
INSERT INTO AUTOR (NOMBRES, APELLIDOS, NACIONALIDAD) VALUES ('Alan', 'Beaulieu', 'Estados Unidos');
INSERT INTO AUTOR (NOMBRES, APELLIDOS, NACIONALIDAD) VALUES ('Steven', 'Feuerstein', 'Estados Unidos');
INSERT INTO AUTOR (NOMBRES, APELLIDOS, NACIONALIDAD) VALUES ('Boris', 'Cherny', 'Estados Unidos');

COMMIT;
