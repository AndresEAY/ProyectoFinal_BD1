$RootDir = Split-Path -Parent $PSScriptRoot
$EnvFile = Join-Path $RootDir ".env"
if (-not (Test-Path $EnvFile)) {
    Write-Error "No existe $EnvFile. Copia .env.example a .env y ajusta los valores."
    exit 1
}
Get-Content $EnvFile | Where-Object { $_ -match '^\s*[^#].*=' } | ForEach-Object {
    $name, $value = $_ -split '=', 2
    Set-Variable -Name $name.Trim() -Value $value.Trim() -Scope Script
}
$SysConn = "system/${DB_SYSTEM_PASSWORD}@//localhost:1521/$DB_SERVICE"
$AppConn = "${APP_USER}/${APP_USER_PASSWORD}@//localhost:1521/$DB_SERVICE"
