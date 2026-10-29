-- Datos de prueba: usuarios por rol, libros con autores, ejemplares, préstamos y devoluciones.
-- Contraseña de todos los usuarios de prueba: Biblio2026 (hash BCrypt).
INSERT INTO USUARIO (CODIGO, NOMBRES, APELLIDOS, CORREO, TELEFONO, DIRECCION, ESTADO, ID_ROL, USERNAME, PASSWORD_HASH)
SELECT d.codigo, d.nombres, d.apellidos, d.correo, d.telefono, d.direccion, d.estado, r.ID_ROL, d.username, '$2a$10$JRkEEPFparLyW7Pq7ja7zeNUs4PXFvam1BGaGqd9WIwivkVa6nJDu'
FROM (
  SELECT 'ADM001' codigo, 'Carlos' nombres, 'Méndez López' apellidos, 'carlos.mendez@biblioteca.edu' correo, '5555-0001' telefono, 'Zona 1, Guatemala' direccion, 'A' estado, 'ADMIN' rol, 'admin' username FROM dual
  UNION ALL SELECT 'ADM002', 'Lucía', 'Herrera Paz', 'lucia.herrera@biblioteca.edu', '5555-0002', 'Zona 10, Guatemala', 'A', 'ADMIN', 'admin2' FROM dual
  UNION ALL SELECT 'BIB001', 'Ana', 'Morales Ruiz', 'ana.morales@biblioteca.edu', '5555-0003', 'Zona 5, Guatemala', 'A', 'BIBLIOTECARIO', 'biblio1' FROM dual
  UNION ALL SELECT 'BIB002', 'Jorge', 'Castillo Díaz', 'jorge.castillo@biblioteca.edu', '5555-0004', 'Mixco', 'A', 'BIBLIOTECARIO', 'biblio2' FROM dual
  UNION ALL SELECT 'PRO001', 'María', 'González Soto', 'maria.gonzalez@universidad.edu', '5555-0005', 'Zona 15, Guatemala', 'A', 'PROFESOR', 'profesor1' FROM dual
  UNION ALL SELECT 'PRO002', 'Roberto', 'Pérez Juárez', 'roberto.perez@universidad.edu', '5555-0006', 'Villa Nueva', 'A', 'PROFESOR', 'profesor2' FROM dual
  UNION ALL SELECT 'PRO003', 'Sofía', 'Ramírez Cano', 'sofia.ramirez@universidad.edu', '5555-0007', 'Antigua Guatemala', 'A', 'PROFESOR', 'profesor3' FROM dual
  UNION ALL SELECT 'EST001', 'Diego', 'Hernández Gil', 'diego.hernandez@alumnos.edu', '5555-0008', 'Zona 7, Guatemala', 'A', 'ESTUDIANTE', 'estudiante1' FROM dual
  UNION ALL SELECT 'EST002', 'Valeria', 'López Martínez', 'valeria.lopez@alumnos.edu', '5555-0009', 'Zona 11, Guatemala', 'A', 'ESTUDIANTE', 'estudiante2' FROM dual
  UNION ALL SELECT 'EST003', 'Andrés', 'García Rivas', 'andres.garcia@alumnos.edu', '5555-0010', 'San Lucas', 'A', 'ESTUDIANTE', 'estudiante3' FROM dual
  UNION ALL SELECT 'EST004', 'Camila', 'Torres Vega', 'camila.torres@alumnos.edu', '5555-0011', 'Zona 12, Guatemala', 'A', 'ESTUDIANTE', 'estudiante4' FROM dual
  UNION ALL SELECT 'EST005', 'Luis', 'Flores Ortiz', 'luis.flores@alumnos.edu', '5555-0012', 'Chinautla', 'I', 'ESTUDIANTE', 'estudiante5' FROM dual
) d
JOIN ROL r ON r.NOMBRE = d.rol;

INSERT INTO LIBRO (ISBN, TITULO, ANIO_PUBLICACION, EDICION, IDIOMA, NUM_PAGINAS, ID_EDITORIAL, ID_CATEGORIA, ESTADO)
SELECT d.isbn, d.titulo, d.anio, d.edicion, d.idioma, d.paginas, e.ID_EDITORIAL, c.ID_CATEGORIA, d.estado
FROM (
  SELECT '9780078022159' isbn, 'Fundamentos de Bases de Datos' titulo, 2019 anio, '7a' edicion, 'Español' idioma, 1376 paginas, 'McGraw-Hill' editorial, 'Bases de Datos' categoria, 'A' estado FROM dual
  UNION ALL SELECT '9780133970777', 'Fundamentals of Database Systems', 2016, '7a', 'Inglés', 1280, 'Pearson', 'Bases de Datos', 'A' FROM dual
  UNION ALL SELECT '9781492057611', 'Learning SQL', 2020, '3a', 'Inglés', 380, 'O''Reilly Media', 'Bases de Datos', 'A' FROM dual
  UNION ALL SELECT '9781449324452', 'Oracle PL/SQL Programming', 2014, '6a', 'Inglés', 1340, 'O''Reilly Media', 'Bases de Datos', 'A' FROM dual
  UNION ALL SELECT '9780134685991', 'Effective Java', 2018, '3a', 'Inglés', 412, 'Addison-Wesley', 'Programación', 'A' FROM dual
  UNION ALL SELECT '9780132350884', 'Clean Code', 2008, '1a', 'Inglés', 464, 'Pearson', 'Programación', 'A' FROM dual
  UNION ALL SELECT '9780134757599', 'Refactoring', 2018, '2a', 'Inglés', 448, 'Addison-Wesley', 'Programación', 'A' FROM dual
  UNION ALL SELECT '9780131103627', 'El Lenguaje de Programación C', 1988, '2a', 'Español', 272, 'Pearson', 'Programación', 'A' FROM dual
  UNION ALL SELECT '9781492052203', 'Programming TypeScript', 2019, '1a', 'Inglés', 322, 'O''Reilly Media', 'Programación', 'A' FROM dual
  UNION ALL SELECT '9786075228235', 'Cálculo de una Variable', 2017, '8a', 'Español', 920, 'Cengage Learning', 'Matemáticas', 'A' FROM dual
  UNION ALL SELECT '9781260091991', 'Matemática Discreta y sus Aplicaciones', 2019, '8a', 'Español', 1120, 'McGraw-Hill', 'Matemáticas', 'A' FROM dual
  UNION ALL SELECT '9786073228831', 'Cálculo Multivariable', 2016, '8a', 'Español', 600, 'Cengage Learning', 'Matemáticas', 'A' FROM dual
  UNION ALL SELECT '9786073239295', 'Redes de Computadoras', 2012, '5a', 'Español', 816, 'Pearson', 'Redes', 'A' FROM dual
  UNION ALL SELECT '9780135928615', 'Computer Networking: A Top-Down Approach', 2021, '8a', 'Inglés', 800, 'Pearson', 'Redes', 'A' FROM dual
  UNION ALL SELECT '9786073236645', 'Sistemas Operativos Modernos', 2015, '4a', 'Español', 1136, 'Pearson', 'Redes', 'A' FROM dual
  UNION ALL SELECT '9780133943030', 'Software Engineering', 2015, '10a', 'Inglés', 816, 'Pearson', 'Ingeniería de Software', 'A' FROM dual
  UNION ALL SELECT '9781259872976', 'Ingeniería del Software: un Enfoque Práctico', 2019, '9a', 'Español', 704, 'McGraw-Hill', 'Ingeniería de Software', 'A' FROM dual
  UNION ALL SELECT '9780321127426', 'Patterns of Enterprise Application Architecture', 2002, '1a', 'Inglés', 560, 'Addison-Wesley', 'Ingeniería de Software', 'A' FROM dual
  UNION ALL SELECT '9788497592208', 'Cien Años de Soledad', 2007, 'Conmemorativa', 'Español', 496, 'Penguin Random House', 'Literatura', 'A' FROM dual
  UNION ALL SELECT '9788437604183', 'El Señor Presidente', 2000, '3a', 'Español', 480, 'Penguin Random House', 'Literatura', 'A' FROM dual
  UNION ALL SELECT '9788497593793', 'El Otoño del Patriarca', 1975, '1a', 'Español', 304, 'Penguin Random House', 'Literatura', 'I' FROM dual
) d
JOIN EDITORIAL e ON e.NOMBRE = d.editorial
JOIN CATEGORIA c ON c.NOMBRE = d.categoria;

INSERT INTO LIBRO_AUTOR (ID_LIBRO, ID_AUTOR)
SELECT l.ID_LIBRO, a.ID_AUTOR
FROM (
  SELECT '9780078022159' isbn, 'Silberschatz' autor FROM dual
  UNION ALL SELECT '9780078022159', 'Korth' FROM dual
  UNION ALL SELECT '9780133970777', 'Elmasri' FROM dual
  UNION ALL SELECT '9780133970777', 'Navathe' FROM dual
  UNION ALL SELECT '9781492057611', 'Beaulieu' FROM dual
  UNION ALL SELECT '9781449324452', 'Feuerstein' FROM dual
  UNION ALL SELECT '9780134685991', 'Bloch' FROM dual
  UNION ALL SELECT '9780132350884', 'Martin' FROM dual
  UNION ALL SELECT '9780134757599', 'Fowler' FROM dual
  UNION ALL SELECT '9780131103627', 'Kernighan' FROM dual
  UNION ALL SELECT '9780131103627', 'Ritchie' FROM dual
  UNION ALL SELECT '9781492052203', 'Cherny' FROM dual
  UNION ALL SELECT '9786075228235', 'Stewart' FROM dual
  UNION ALL SELECT '9781260091991', 'Rosen' FROM dual
  UNION ALL SELECT '9786073228831', 'Stewart' FROM dual
  UNION ALL SELECT '9786073239295', 'Tanenbaum' FROM dual
  UNION ALL SELECT '9780135928615', 'Kurose' FROM dual
  UNION ALL SELECT '9780135928615', 'Ross' FROM dual
  UNION ALL SELECT '9786073236645', 'Tanenbaum' FROM dual
  UNION ALL SELECT '9780133943030', 'Sommerville' FROM dual
  UNION ALL SELECT '9781259872976', 'Pressman' FROM dual
  UNION ALL SELECT '9780321127426', 'Fowler' FROM dual
  UNION ALL SELECT '9788497592208', 'García Márquez' FROM dual
  UNION ALL SELECT '9788437604183', 'Asturias' FROM dual
  UNION ALL SELECT '9788497593793', 'García Márquez' FROM dual
) d
JOIN LIBRO l ON l.ISBN = d.isbn
JOIN AUTOR a ON a.APELLIDOS = d.autor;

INSERT INTO EJEMPLAR (ID_LIBRO, CODIGO_BARRAS, ESTADO, FECHA_ADQUISICION)
SELECT l.ID_LIBRO, 'EJ-' || l.ISBN || '-' || n.copia, 'DISPONIBLE', DATE '2024-01-15' + MOD(l.ID_LIBRO * 17, 300)
FROM LIBRO l
JOIN (SELECT LEVEL copia FROM dual CONNECT BY LEVEL <= 3) n
  ON n.copia <= CASE WHEN l.ID_LIBRO <= 6 THEN 3 ELSE 2 END;

INSERT INTO PRESTAMO (ID_USUARIO, ID_EJEMPLAR, ID_BIBLIOTECARIO, FECHA_PRESTAMO, FECHA_DEVOLUCION_PREVISTA, ESTADO)
SELECT u.ID_USUARIO, e.ID_EJEMPLAR, b.ID_USUARIO, TRUNC(SYSDATE) - d.hace, TRUNC(SYSDATE) - d.hace + r.DIAS_PRESTAMO, d.estado
FROM (
  SELECT 'EST001' usuario, 'EJ-9780078022159-1' ejemplar, 'BIB001' biblio, 150 hace, 'DEVUELTO' estado FROM dual
  UNION ALL SELECT 'EST002', 'EJ-9780134685991-1', 'BIB001', 130, 'DEVUELTO' FROM dual
  UNION ALL SELECT 'PRO001', 'EJ-9780133970777-1', 'BIB002', 120, 'DEVUELTO' FROM dual
  UNION ALL SELECT 'EST003', 'EJ-9780132350884-1', 'BIB002', 100, 'DEVUELTO' FROM dual
  UNION ALL SELECT 'PRO002', 'EJ-9786073239295-1', 'BIB001', 90, 'DEVUELTO' FROM dual
  UNION ALL SELECT 'EST004', 'EJ-9788497592208-1', 'BIB001', 75, 'DEVUELTO' FROM dual
  UNION ALL SELECT 'EST001', 'EJ-9780078022159-2', 'BIB002', 60, 'DEVUELTO' FROM dual
  UNION ALL SELECT 'PRO003', 'EJ-9780134757599-1', 'BIB002', 45, 'DEVUELTO' FROM dual
  UNION ALL SELECT 'EST002', 'EJ-9781492057611-1', 'BIB001', 30, 'DEVUELTO' FROM dual
  UNION ALL SELECT 'EST005', 'EJ-9786075228235-1', 'BIB001', 200, 'DEVUELTO' FROM dual
  UNION ALL SELECT 'EST001', 'EJ-9780133970777-2', 'BIB001', 3, 'ACTIVO' FROM dual
  UNION ALL SELECT 'EST002', 'EJ-9780132350884-2', 'BIB001', 2, 'ACTIVO' FROM dual
  UNION ALL SELECT 'EST002', 'EJ-9780134685991-2', 'BIB002', 2, 'ACTIVO' FROM dual
  UNION ALL SELECT 'EST002', 'EJ-9786073239295-2', 'BIB002', 1, 'ACTIVO' FROM dual
  UNION ALL SELECT 'PRO001', 'EJ-9781449324452-1', 'BIB001', 5, 'ACTIVO' FROM dual
  UNION ALL SELECT 'PRO002', 'EJ-9780321127426-1', 'BIB002', 10, 'ACTIVO' FROM dual
  UNION ALL SELECT 'EST003', 'EJ-9781260091991-1', 'BIB001', 20, 'VENCIDO' FROM dual
  UNION ALL SELECT 'PRO003', 'EJ-9780133943030-1', 'BIB002', 25, 'VENCIDO' FROM dual
) d
JOIN USUARIO u ON u.CODIGO = d.usuario
JOIN ROL r ON r.ID_ROL = u.ID_ROL
JOIN EJEMPLAR e ON e.CODIGO_BARRAS = d.ejemplar
JOIN USUARIO b ON b.CODIGO = d.biblio;

INSERT INTO DEVOLUCION (ID_PRESTAMO, FECHA_DEVOLUCION_REAL, A_TIEMPO, DIAS_RETRASO, OBSERVACIONES, ID_BIBLIOTECARIO)
SELECT p.ID_PRESTAMO, p.FECHA_DEVOLUCION_PREVISTA + d.retraso,
       CASE WHEN d.retraso <= 0 THEN 'S' ELSE 'N' END,
       GREATEST(d.retraso, 0), d.observaciones, b.ID_USUARIO
FROM (
  SELECT 'EJ-9780078022159-1' ejemplar, -2 retraso, 'Buen estado' observaciones, 'BIB001' biblio FROM dual
  UNION ALL SELECT 'EJ-9780134685991-1', 0, 'Buen estado', 'BIB001' FROM dual
  UNION ALL SELECT 'EJ-9780133970777-1', -5, NULL, 'BIB002' FROM dual
  UNION ALL SELECT 'EJ-9780132350884-1', 4, 'Devuelto con retraso', 'BIB002' FROM dual
  UNION ALL SELECT 'EJ-9786073239295-1', -1, NULL, 'BIB001' FROM dual
  UNION ALL SELECT 'EJ-9788497592208-1', 9, 'Devuelto con retraso, portada dañada', 'BIB001' FROM dual
  UNION ALL SELECT 'EJ-9780078022159-2', 1, 'Devuelto con retraso', 'BIB002' FROM dual
  UNION ALL SELECT 'EJ-9780134757599-1', -3, NULL, 'BIB002' FROM dual
  UNION ALL SELECT 'EJ-9781492057611-1', 2, NULL, 'BIB001' FROM dual
  UNION ALL SELECT 'EJ-9786075228235-1', 0, 'Último préstamo antes de inactivar al usuario', 'BIB001' FROM dual
) d
JOIN EJEMPLAR e ON e.CODIGO_BARRAS = d.ejemplar
JOIN PRESTAMO p ON p.ID_EJEMPLAR = e.ID_EJEMPLAR AND p.ESTADO = 'DEVUELTO'
JOIN USUARIO b ON b.CODIGO = d.biblio;

UPDATE EJEMPLAR SET ESTADO = 'PRESTADO'
WHERE ID_EJEMPLAR IN (SELECT ID_EJEMPLAR FROM PRESTAMO WHERE ESTADO IN ('ACTIVO', 'VENCIDO'));

UPDATE EJEMPLAR SET ESTADO = 'DANADO' WHERE CODIGO_BARRAS = 'EJ-9788497592208-1';
UPDATE EJEMPLAR SET ESTADO = 'PERDIDO' WHERE CODIGO_BARRAS = 'EJ-9786073236645-2';
UPDATE EJEMPLAR SET ESTADO = 'INACTIVO' WHERE CODIGO_BARRAS IN ('EJ-9788497593793-1', 'EJ-9788497593793-2');

COMMIT;
