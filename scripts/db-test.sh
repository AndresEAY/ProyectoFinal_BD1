#!/usr/bin/env bash
set -e
. "$(dirname "$0")/env.sh"
docker exec -u root "$DB_CONTAINER" rm -rf /tmp/biblioteca_db
docker cp "$ROOT_DIR/db" "$DB_CONTAINER:/tmp/biblioteca_db"
docker exec -i -w /tmp/biblioteca_db "$DB_CONTAINER" sqlplus -s -L "$APP_CONN" @99_pruebas.sql
