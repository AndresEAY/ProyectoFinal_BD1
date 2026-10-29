$ErrorActionPreference = "Stop"
. "$PSScriptRoot\env.ps1"
$exists = docker ps -a --format "{{.Names}}" | Where-Object { $_ -eq $DB_CONTAINER }
if ($exists) {
    docker start $DB_CONTAINER | Out-Null
} else {
    docker compose -f "$RootDir\docker-compose.yml" --env-file "$RootDir\.env" up -d
}
Write-Host "Esperando a Oracle en $DB_CONTAINER ($DB_SERVICE)..."
for ($i = 0; $i -lt 90; $i++) {
    $out = "SELECT 'OK' FROM dual;" | docker exec -i $DB_CONTAINER sqlplus -s -L $SysConn 2>$null
    if ($out -match '^OK') {
        Write-Host "Oracle listo."
        exit 0
    }
    Start-Sleep -Seconds 5
}
Write-Error "Oracle no respondió a tiempo."
exit 1
