#!/usr/bin/env bash
set -e
. "$(dirname "$0")/env.sh"
docker exec -i "$DB_CONTAINER" sqlplus -s -L "$SYS_CONN" <<SQL
SET SERVEROUTPUT ON FEEDBACK OFF
BEGIN
  EXECUTE IMMEDIATE 'DROP USER $APP_USER CASCADE';
  DBMS_OUTPUT.PUT_LINE('Usuario $APP_USER eliminado.');
EXCEPTION
  WHEN OTHERS THEN
    IF SQLCODE != -1918 THEN RAISE; END IF;
END;
/
EXIT
SQL
"$(dirname "$0")/db-create-user.sh"
"$(dirname "$0")/db-install.sh"
