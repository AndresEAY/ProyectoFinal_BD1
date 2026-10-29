param([switch]$System)
. "$PSScriptRoot\env.ps1"
if ($System) {
    docker exec -it $DB_CONTAINER sqlplus -L $SysConn
} else {
    docker exec -it $DB_CONTAINER sqlplus -L $AppConn
}
