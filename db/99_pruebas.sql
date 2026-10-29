-- Pruebas de PKG_BIBLIOTECA y de la bitácora (RN1–RN9). Imprime OK/FALLO por caso y deshace todos los cambios al final.
SET SERVEROUTPUT ON SIZE UNLIMITED
SET FEEDBACK OFF
SET LINESIZE 200
ALTER SESSION SET TIME_ZONE = '-06:00';
DECLARE
  v_ok             NUMBER := 0;
  v_fallos         NUMBER := 0;
  v_id_prestamo    NUMBER;
  v_id_devolucion  NUMBER;
  v_biblio         NUMBER;
  v_numero         NUMBER;
  v_texto          VARCHAR2(100);
  v_fecha          DATE;
  v_id_usuario     NUMBER;
  v_id_ejemplar    NUMBER;

  FUNCTION id_usuario (p_codigo VARCHAR2) RETURN NUMBER IS
    v NUMBER;
  BEGIN
    SELECT ID_USUARIO INTO v FROM USUARIO WHERE CODIGO = p_codigo;
    RETURN v;
  END;

  FUNCTION id_ejemplar (p_codigo_barras VARCHAR2) RETURN NUMBER IS
    v NUMBER;
  BEGIN
    SELECT ID_EJEMPLAR INTO v FROM EJEMPLAR WHERE CODIGO_BARRAS = p_codigo_barras;
    RETURN v;
  END;

  FUNCTION id_prestamo_abierto (p_codigo_barras VARCHAR2) RETURN NUMBER IS
    v NUMBER;
  BEGIN
    SELECT p.ID_PRESTAMO INTO v
      FROM PRESTAMO p JOIN EJEMPLAR e ON e.ID_EJEMPLAR = p.ID_EJEMPLAR
     WHERE e.CODIGO_BARRAS = p_codigo_barras AND p.ESTADO IN ('ACTIVO', 'VENCIDO');
    RETURN v;
  END;

  PROCEDURE verificar (p_caso VARCHAR2, p_condicion BOOLEAN) IS
  BEGIN
    IF p_condicion THEN
      v_ok := v_ok + 1;
      DBMS_OUTPUT.PUT_LINE('OK     ' || p_caso);
    ELSE
      v_fallos := v_fallos + 1;
      DBMS_OUTPUT.PUT_LINE('FALLO  ' || p_caso);
    END IF;
  END;

  PROCEDURE esperar_error (p_caso VARCHAR2, p_codigo NUMBER, p_usuario VARCHAR2, p_ejemplar VARCHAR2, p_bibliotecario VARCHAR2 DEFAULT 'BIB001') IS
    v_id NUMBER;
  BEGIN
    PKG_BIBLIOTECA.SP_REGISTRAR_PRESTAMO(id_usuario(p_usuario), id_ejemplar(p_ejemplar), id_usuario(p_bibliotecario), v_id);
    verificar(p_caso || ' (no lanzó error)', FALSE);
  EXCEPTION
    WHEN OTHERS THEN
      verificar(p_caso || ' -> ' || SQLERRM, SQLCODE = p_codigo);
  END;
BEGIN
  DBMS_SESSION.SET_IDENTIFIER('PRUEBA_99');
  v_biblio := id_usuario('BIB001');

  PKG_BIBLIOTECA.SP_REGISTRAR_PRESTAMO(id_usuario('EST001'), id_ejemplar('EJ-9780131103627-1'), v_biblio, v_id_prestamo);
  SELECT p.FECHA_DEVOLUCION_PREVISTA, e.ESTADO INTO v_fecha, v_texto
    FROM PRESTAMO p JOIN EJEMPLAR e ON e.ID_EJEMPLAR = p.ID_EJEMPLAR WHERE p.ID_PRESTAMO = v_id_prestamo;
  verificar('P1 préstamo válido crea registro', v_id_prestamo IS NOT NULL);
  verificar('P2 RN3 fecha prevista = hoy + 7 días (estudiante)', v_fecha = TRUNC(CURRENT_DATE) + 7);
  verificar('P3 RN2 ejemplar pasa a PRESTADO', v_texto = 'PRESTADO');

  esperar_error('E1 RN1 ejemplar ya prestado', -20007, 'PRO001', 'EJ-9780131103627-1');
  esperar_error('E2 RN1 ejemplar dañado', -20007, 'PRO001', 'EJ-9788497592208-1');
  esperar_error('E3 RN4 límite de préstamos activos', -20005, 'EST002', 'EJ-9780131103627-2');
  esperar_error('E4 RN5 usuario con préstamo vencido', -20004, 'EST003', 'EJ-9780131103627-2');
  esperar_error('E5 RN6 usuario inactivo', -20002, 'EST005', 'EJ-9780131103627-2');
  esperar_error('E6 registra un usuario que no es bibliotecario', -20003, 'PRO001', 'EJ-9780131103627-2', 'EST001');
  esperar_error('E7 libro inactivo', -20008, 'PRO001', 'EJ-9788497593793-1');

  BEGIN
    PKG_BIBLIOTECA.SP_REGISTRAR_PRESTAMO(-1, id_ejemplar('EJ-9780131103627-2'), v_biblio, v_numero);
    verificar('E8 usuario inexistente (no lanzó error)', FALSE);
  EXCEPTION
    WHEN OTHERS THEN verificar('E8 usuario inexistente -> ' || SQLERRM, SQLCODE = -20001);
  END;

  v_id_usuario := id_usuario('PRO001');
  v_id_ejemplar := id_ejemplar('EJ-9780131103627-1');
  BEGIN
    INSERT INTO PRESTAMO (ID_USUARIO, ID_EJEMPLAR, ID_BIBLIOTECARIO, FECHA_PRESTAMO, FECHA_DEVOLUCION_PREVISTA, ESTADO)
    VALUES (v_id_usuario, v_id_ejemplar, v_biblio, TRUNC(CURRENT_DATE), TRUNC(CURRENT_DATE) + 1, 'ACTIVO');
    verificar('E9 índice único: dos préstamos abiertos del mismo ejemplar (no lanzó error)', FALSE);
  EXCEPTION
    WHEN DUP_VAL_ON_INDEX THEN verificar('E9 índice único: dos préstamos abiertos del mismo ejemplar', TRUE);
  END;

  PKG_BIBLIOTECA.SP_REGISTRAR_DEVOLUCION(v_id_prestamo, v_biblio, 'Prueba a tiempo', 'DISPONIBLE', v_id_devolucion);
  SELECT d.A_TIEMPO, d.DIAS_RETRASO INTO v_texto, v_numero FROM DEVOLUCION d WHERE d.ID_DEVOLUCION = v_id_devolucion;
  verificar('D1 RN7 devolución a tiempo: A_TIEMPO=S, DIAS_RETRASO=0', v_texto = 'S' AND v_numero = 0);
  SELECT ESTADO INTO v_texto FROM EJEMPLAR WHERE CODIGO_BARRAS = 'EJ-9780131103627-1';
  verificar('D2 RN2 ejemplar vuelve a DISPONIBLE', v_texto = 'DISPONIBLE');
  SELECT ESTADO INTO v_texto FROM PRESTAMO WHERE ID_PRESTAMO = v_id_prestamo;
  verificar('D3 préstamo queda DEVUELTO', v_texto = 'DEVUELTO');

  BEGIN
    PKG_BIBLIOTECA.SP_REGISTRAR_DEVOLUCION(v_id_prestamo, v_biblio, NULL, 'DISPONIBLE', v_id_devolucion);
    verificar('D4 RN8 doble devolución (no lanzó error)', FALSE);
  EXCEPTION
    WHEN OTHERS THEN verificar('D4 RN8 doble devolución -> ' || SQLERRM, SQLCODE = -20011);
  END;

  v_id_prestamo := id_prestamo_abierto('EJ-9780133943030-1');
  SELECT TRUNC(CURRENT_DATE) - FECHA_DEVOLUCION_PREVISTA INTO v_numero FROM PRESTAMO WHERE ID_PRESTAMO = v_id_prestamo;
  PKG_BIBLIOTECA.SP_REGISTRAR_DEVOLUCION(v_id_prestamo, v_biblio, 'Prueba tardía', 'DANADO', v_id_devolucion);
  SELECT A_TIEMPO INTO v_texto FROM DEVOLUCION WHERE ID_DEVOLUCION = v_id_devolucion;
  verificar('D5 RN7 devolución tardía: A_TIEMPO=N', v_texto = 'N');
  SELECT COUNT(*) INTO v_numero FROM DEVOLUCION WHERE ID_DEVOLUCION = v_id_devolucion AND DIAS_RETRASO = v_numero AND DIAS_RETRASO > 0;
  verificar('D6 RN7 DIAS_RETRASO = hoy - fecha prevista', v_numero = 1);
  SELECT ESTADO INTO v_texto FROM EJEMPLAR WHERE CODIGO_BARRAS = 'EJ-9780133943030-1';
  verificar('D7 RN2 ejemplar reportado como DANADO', v_texto = 'DANADO');

  BEGIN
    PKG_BIBLIOTECA.SP_REGISTRAR_DEVOLUCION(id_prestamo_abierto('EJ-9780321127426-1'), v_biblio, NULL, 'ROTO', v_id_devolucion);
    verificar('D8 estado de ejemplar inválido (no lanzó error)', FALSE);
  EXCEPTION
    WHEN OTHERS THEN verificar('D8 estado de ejemplar inválido -> ' || SQLERRM, SQLCODE = -20012);
  END;

  v_id_prestamo := id_prestamo_abierto('EJ-9780321127426-1');
  UPDATE PRESTAMO SET FECHA_PRESTAMO = TRUNC(CURRENT_DATE) - 20, FECHA_DEVOLUCION_PREVISTA = TRUNC(CURRENT_DATE) - 1
   WHERE ID_PRESTAMO = v_id_prestamo;
  PKG_BIBLIOTECA.SP_ACTUALIZAR_VENCIDOS;
  SELECT ESTADO INTO v_texto FROM PRESTAMO WHERE ID_PRESTAMO = v_id_prestamo;
  verificar('V1 SP_ACTUALIZAR_VENCIDOS marca VENCIDO', v_texto = 'VENCIDO');

  SELECT ID_LIBRO INTO v_numero FROM LIBRO WHERE ISBN = '9780078022159';
  verificar('F1 FN_EJEMPLARES_DISPONIBLES (3 copias, 0 prestadas)', PKG_BIBLIOTECA.FN_EJEMPLARES_DISPONIBLES(v_numero) = 3);
  SELECT ID_LIBRO INTO v_numero FROM LIBRO WHERE ISBN = '9780133970777';
  verificar('F2 FN_EJEMPLARES_DISPONIBLES (3 copias, 1 prestada)', PKG_BIBLIOTECA.FN_EJEMPLARES_DISPONIBLES(v_numero) = 2);

  SELECT COUNT(*) INTO v_numero FROM BITACORA WHERE USUARIO = 'PRUEBA_99' AND TABLA = 'PRESTAMO' AND OPERACION = 'INSERT';
  verificar('B1 RN9 bitácora registra INSERT de PRESTAMO con el usuario de la aplicación', v_numero = 1);
  SELECT COUNT(*) INTO v_numero FROM BITACORA WHERE USUARIO = 'PRUEBA_99' AND TABLA = 'DEVOLUCION' AND OPERACION = 'INSERT';
  verificar('B2 RN9 bitácora registra las 2 devoluciones', v_numero = 2);
  SELECT COUNT(*) INTO v_numero FROM BITACORA WHERE USUARIO = 'PRUEBA_99' AND TABLA = 'EJEMPLAR' AND OPERACION = 'UPDATE' AND DATOS_ANTERIORES IS NOT NULL AND DATOS_NUEVOS IS NOT NULL;
  verificar('B3 RN9 bitácora guarda datos anteriores y nuevos de EJEMPLAR', v_numero >= 3);

  DBMS_SESSION.CLEAR_IDENTIFIER;
  ROLLBACK;
  DBMS_OUTPUT.PUT_LINE('----------------------------------------');
  DBMS_OUTPUT.PUT_LINE('Resultado: ' || v_ok || ' OK, ' || v_fallos || ' FALLO(S). Cambios deshechos con ROLLBACK.');
END;
/
EXIT
