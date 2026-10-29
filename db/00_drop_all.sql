-- Elimina todos los objetos del esquema de la biblioteca para poder reinstalar.
-- Ignora los objetos que no existan.
BEGIN
  FOR o IN (
    SELECT 'PACKAGE PKG_BIBLIOTECA' AS obj FROM dual
    UNION ALL SELECT 'PROCEDURE SP_REGISTRAR_BITACORA' FROM dual
    UNION ALL SELECT 'VIEW ' || view_name FROM user_views WHERE view_name LIKE 'VW\_%' ESCAPE '\'
  ) LOOP
    BEGIN
      EXECUTE IMMEDIATE 'DROP ' || o.obj;
    EXCEPTION
      WHEN OTHERS THEN NULL;
    END;
  END LOOP;
  FOR t IN (
    SELECT column_value AS tabla FROM TABLE(sys.odcivarchar2list(
      'BITACORA', 'DEVOLUCION', 'PRESTAMO', 'EJEMPLAR', 'LIBRO_AUTOR', 'LIBRO',
      'CATEGORIA', 'EDITORIAL', 'AUTOR', 'USUARIO', 'ROL'))
  ) LOOP
    BEGIN
      EXECUTE IMMEDIATE 'DROP TABLE ' || t.tabla || ' CASCADE CONSTRAINTS PURGE';
    EXCEPTION
      WHEN OTHERS THEN
        IF SQLCODE != -942 THEN RAISE; END IF;
    END;
  END LOOP;
END;
/
