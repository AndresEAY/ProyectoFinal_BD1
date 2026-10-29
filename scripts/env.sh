ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
if [ ! -f "$ROOT_DIR/.env" ]; then
  echo "No existe $ROOT_DIR/.env. Copia .env.example a .env y ajusta los valores." >&2
  exit 1
fi
set -a
. "$ROOT_DIR/.env"
set +a
SYS_CONN="system/\"$DB_SYSTEM_PASSWORD\"@//localhost:1521/$DB_SERVICE"
APP_CONN="$APP_USER/\"$APP_USER_PASSWORD\"@//localhost:1521/$DB_SERVICE"
