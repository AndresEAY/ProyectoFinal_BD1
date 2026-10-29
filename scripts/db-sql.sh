#!/usr/bin/env bash
. "$(dirname "$0")/env.sh"
if [ "$1" = "--system" ]; then
  docker exec -it "$DB_CONTAINER" sqlplus -L "$SYS_CONN"
else
  docker exec -it "$DB_CONTAINER" sqlplus -L "$APP_CONN"
fi
