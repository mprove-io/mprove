#!/bin/bash

start_wait=10
retry_wait=5

db=/persist/home.sqlite3
echo "Patch MPROVE_GRIST_API_KEY Start waiting $start_wait seconds..."
sleep $start_wait

sqlite3 $db -cmd "UPDATE "users" SET "api_key" = '$MPROVE_GRIST_API_KEY' WHERE "id" = '5'" ".quit" 2>&1 >/dev/null

until [ "$(sqlite3 $db -cmd "select api_key from users where id=5" ".quit")" = "$MPROVE_GRIST_API_KEY" ]
do
  echo "Patch MPROVE_GRIST_API_KEY Retry waiting $retry_wait seconds..."
  sleep $retry_wait
  sqlite3 $db -cmd "UPDATE "users" SET "api_key" = '$MPROVE_GRIST_API_KEY' WHERE "id" = '5'" ".quit" 2>&1 >/dev/null
done
echo 'Patch MPROVE_GRIST_API_KEY Success'


