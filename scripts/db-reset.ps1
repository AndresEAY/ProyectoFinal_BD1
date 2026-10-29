$ErrorActionPreference = "Stop"
. "$PSScriptRoot\env.ps1"
$sql = @"
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
"@
$sql | docker exec -i $DB_CONTAINER sqlplus -s -L $SysConn
& "$PSScriptRoot\db-create-user.ps1"
& "$PSScriptRoot\db-install.ps1"
