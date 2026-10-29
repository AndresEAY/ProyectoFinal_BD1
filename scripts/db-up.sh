#!/usr/bin/env bash
set -e
. "$(dirname "$0")/env.sh"
if docker ps -a --format '{{.Names}}' | grep -qx "$DB_CONTAINER"; then
  docker start "$DB_CONTAINER" >/dev/null
else
  docker compose -f "$ROOT_DIR/docker-compose.yml" --env-file "$ROOT_DIR/.env" up -d
fi
echo "Esperando a Oracle en $DB_CONTAINER ($DB_SERVICE)..."
for i in $(seq 1 90); do
  if echo "SELECT 'OK' FROM dual;" | docker exec -i "$DB_CONTAINER" sqlplus -s -L "$SYS_CONN" 2>/dev/null | grep -q '^OK'; then
    echo "Oracle listo."
    exit 0
  fi
  sleep 5
done
echo "Oracle no respondió a tiempo." >&2
exit 1
