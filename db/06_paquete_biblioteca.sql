-- Paquete PKG_BIBLIOTECA: lógica de préstamos y devoluciones (RN1–RN8).
-- Los errores de negocio se lanzan con RAISE_APPLICATION_ERROR (-20001..-20099); la transacción la confirma el cliente.
CREATE OR REPLACE PACKAGE PKG_BIBLIOTECA AS
  PROCEDURE SP_REGISTRAR_PRESTAMO (
    p_id_usuario        IN  NUMBER,
    p_id_ejemplar       IN  NUMBER,
    p_id_bibliotecario  IN  NUMBER,
    p_id_prestamo       OUT NUMBER
  );

  PROCEDURE SP_REGISTRAR_DEVOLUCION (
    p_id_prestamo       IN  NUMBER,
    p_id_bibliotecario  IN  NUMBER,
    p_observaciones     IN  VARCHAR2,
    p_estado_ejemplar   IN  VARCHAR2 DEFAULT 'DISPONIBLE',
    p_id_devolucion     OUT NUMBER
  );

  FUNCTION FN_EJEMPLARES_DISPONIBLES (p_id_libro IN NUMBER) RETURN NUMBER;

  PROCEDURE SP_ACTUALIZAR_VENCIDOS;
END PKG_BIBLIOTECA;
/

CREATE OR REPLACE PACKAGE BODY PKG_BIBLIOTECA AS

  PROCEDURE VALIDAR_BIBLIOTECARIO (p_id_bibliotecario IN NUMBER) IS
    v_count NUMBER;
  BEGIN
    SELECT COUNT(*) INTO v_count
    FROM USUARIO u
    JOIN ROL r ON r.ID_ROL = u.ID_ROL
    WHERE u.ID_USUARIO = p_id_bibliotecario
      AND u.ESTADO = 'A'
      AND r.NOMBRE IN ('ADMIN', 'BIBLIOTECARIO');
    IF v_count = 0 THEN
      RAISE_APPLICATION_ERROR(-20003, 'El usuario que registra la operación no es personal de biblioteca activo.');
    END IF;
  END VALIDAR_BIBLIOTECARIO;

  PROCEDURE SP_ACTUALIZAR_VENCIDOS IS
  BEGIN
    UPDATE PRESTAMO
       SET ESTADO = 'VENCIDO'
     WHERE ESTADO = 'ACTIVO'
       AND FECHA_DEVOLUCION_PREVISTA < TRUNC(CURRENT_DATE);
  END SP_ACTUALIZAR_VENCIDOS;

  FUNCTION FN_EJEMPLARES_DISPONIBLES (p_id_libro IN NUMBER) RETURN NUMBER IS
    v_count NUMBER;
  BEGIN
    SELECT COUNT(*) INTO v_count
    FROM EJEMPLAR
    WHERE ID_LIBRO = p_id_libro
      AND ESTADO = 'DISPONIBLE';
    RETURN v_count;
  END FN_EJEMPLARES_DISPONIBLES;

  PROCEDURE SP_REGISTRAR_PRESTAMO (
    p_id_usuario        IN  NUMBER,
    p_id_ejemplar       IN  NUMBER,
    p_id_bibliotecario  IN  NUMBER,
    p_id_prestamo       OUT NUMBER
  ) IS
    v_estado_usuario   USUARIO.ESTADO%TYPE;
    v_dias_prestamo    ROL.DIAS_PRESTAMO%TYPE;
    v_max_prestamos    ROL.MAX_PRESTAMOS%TYPE;
    v_estado_ejemplar  EJEMPLAR.ESTADO%TYPE;
    v_estado_libro     LIBRO.ESTADO%TYPE;
    v_vencidos         NUMBER;
    v_activos          NUMBER;
  BEGIN
    SP_ACTUALIZAR_VENCIDOS;

    BEGIN
      SELECT u.ESTADO, r.DIAS_PRESTAMO, r.MAX_PRESTAMOS
        INTO v_estado_usuario, v_dias_prestamo, v_max_prestamos
        FROM USUARIO u
        JOIN ROL r ON r.ID_ROL = u.ID_ROL
       WHERE u.ID_USUARIO = p_id_usuario
         FOR UPDATE OF u.ESTADO;
    EXCEPTION
      WHEN NO_DATA_FOUND THEN
        RAISE_APPLICATION_ERROR(-20001, 'El usuario solicitante no existe.');
    END;

    IF v_estado_usuario <> 'A' THEN
      RAISE_APPLICATION_ERROR(-20002, 'El usuario está inactivo y no puede solicitar préstamos.');
    END IF;

    VALIDAR_BIBLIOTECARIO(p_id_bibliotecario);

    SELECT COUNT(CASE WHEN ESTADO = 'VENCIDO' THEN 1 END),
           COUNT(CASE WHEN ESTADO IN ('ACTIVO', 'VENCIDO') THEN 1 END)
      INTO v_vencidos, v_activos
      FROM PRESTAMO
     WHERE ID_USUARIO = p_id_usuario;

    IF v_vencidos > 0 THEN
      RAISE_APPLICATION_ERROR(-20004, 'El usuario tiene préstamos vencidos; debe devolverlos antes de solicitar otro.');
    END IF;

    IF v_activos >= v_max_prestamos THEN
      RAISE_APPLICATION_ERROR(-20005, 'El usuario alcanzó el máximo de ' || v_max_prestamos || ' préstamos activos permitidos para su rol.');
    END IF;

    BEGIN
      SELECT e.ESTADO, l.ESTADO
        INTO v_estado_ejemplar, v_estado_libro
        FROM EJEMPLAR e
        JOIN LIBRO l ON l.ID_LIBRO = e.ID_LIBRO
       WHERE e.ID_EJEMPLAR = p_id_ejemplar
         FOR UPDATE OF e.ESTADO;
    EXCEPTION
      WHEN NO_DATA_FOUND THEN
        RAISE_APPLICATION_ERROR(-20006, 'El ejemplar no existe.');
    END;

    IF v_estado_libro <> 'A' THEN
      RAISE_APPLICATION_ERROR(-20008, 'El libro de este ejemplar está inactivo.');
    END IF;

    IF v_estado_ejemplar <> 'DISPONIBLE' THEN
      RAISE_APPLICATION_ERROR(-20007, 'El ejemplar no está disponible (estado actual: ' || v_estado_ejemplar || ').');
    END IF;

    INSERT INTO PRESTAMO (ID_USUARIO, ID_EJEMPLAR, ID_BIBLIOTECARIO, FECHA_PRESTAMO, FECHA_DEVOLUCION_PREVISTA, ESTADO)
    VALUES (p_id_usuario, p_id_ejemplar, p_id_bibliotecario, TRUNC(CURRENT_DATE), TRUNC(CURRENT_DATE) + v_dias_prestamo, 'ACTIVO')
    RETURNING ID_PRESTAMO INTO p_id_prestamo;

    UPDATE EJEMPLAR SET ESTADO = 'PRESTADO' WHERE ID_EJEMPLAR = p_id_ejemplar;
  END SP_REGISTRAR_PRESTAMO;

  PROCEDURE SP_REGISTRAR_DEVOLUCION (
    p_id_prestamo       IN  NUMBER,
    p_id_bibliotecario  IN  NUMBER,
    p_observaciones     IN  VARCHAR2,
    p_estado_ejemplar   IN  VARCHAR2 DEFAULT 'DISPONIBLE',
    p_id_devolucion     OUT NUMBER
  ) IS
    v_estado_prestamo  PRESTAMO.ESTADO%TYPE;
    v_fecha_prevista   PRESTAMO.FECHA_DEVOLUCION_PREVISTA%TYPE;
    v_id_ejemplar      PRESTAMO.ID_EJEMPLAR%TYPE;
    v_estado_ejemplar  EJEMPLAR.ESTADO%TYPE := NVL(UPPER(p_estado_ejemplar), 'DISPONIBLE');
    v_dias_retraso     NUMBER;
  BEGIN
    BEGIN
      SELECT ESTADO, FECHA_DEVOLUCION_PREVISTA, ID_EJEMPLAR
        INTO v_estado_prestamo, v_fecha_prevista, v_id_ejemplar
        FROM PRESTAMO
       WHERE ID_PRESTAMO = p_id_prestamo
         FOR UPDATE;
    EXCEPTION
      WHEN NO_DATA_FOUND THEN
        RAISE_APPLICATION_ERROR(-20010, 'El préstamo no existe.');
    END;

    IF v_estado_prestamo = 'DEVUELTO' THEN
      RAISE_APPLICATION_ERROR(-20011, 'El préstamo ya fue devuelto.');
    END IF;

    IF v_estado_ejemplar NOT IN ('DISPONIBLE', 'DANADO', 'PERDIDO') THEN
      RAISE_APPLICATION_ERROR(-20012, 'Estado del ejemplar inválido para una devolución: use DISPONIBLE, DANADO o PERDIDO.');
    END IF;

    VALIDAR_BIBLIOTECARIO(p_id_bibliotecario);

    v_dias_retraso := GREATEST(TRUNC(CURRENT_DATE) - TRUNC(v_fecha_prevista), 0);

    INSERT INTO DEVOLUCION (ID_PRESTAMO, FECHA_DEVOLUCION_REAL, A_TIEMPO, DIAS_RETRASO, OBSERVACIONES, ID_BIBLIOTECARIO)
    VALUES (p_id_prestamo, TRUNC(CURRENT_DATE), CASE WHEN v_dias_retraso = 0 THEN 'S' ELSE 'N' END, v_dias_retraso, p_observaciones, p_id_bibliotecario)
    RETURNING ID_DEVOLUCION INTO p_id_devolucion;

    UPDATE PRESTAMO SET ESTADO = 'DEVUELTO' WHERE ID_PRESTAMO = p_id_prestamo;

    UPDATE EJEMPLAR SET ESTADO = v_estado_ejemplar WHERE ID_EJEMPLAR = v_id_ejemplar;
  END SP_REGISTRAR_DEVOLUCION;

END PKG_BIBLIOTECA;
/
SHOW ERRORS PACKAGE BODY PKG_BIBLIOTECA
