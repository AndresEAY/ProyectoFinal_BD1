$ErrorActionPreference = "Stop"
. "$PSScriptRoot\env.ps1"
docker exec -u root $DB_CONTAINER rm -rf /tmp/biblioteca_db
docker cp "$RootDir\db" "${DB_CONTAINER}:/tmp/biblioteca_db"
docker exec -i -w /tmp/biblioteca_db $DB_CONTAINER sqlplus -s -L $AppConn "@99_pruebas.sql"
