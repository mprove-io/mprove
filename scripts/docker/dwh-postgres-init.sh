#!/usr/bin/env bash
set -euo pipefail

if psql -U postgres -tc "SELECT 1 FROM pg_database WHERE datname = 'p_db'" | grep -q 1; then
    echo "Database 'p_db' already exists → skipping creation"
else
    echo "Creating database 'p_db'..."
    psql -U postgres -c "CREATE DATABASE p_db WITH OWNER=postgres ENCODING='UTF8' TEMPLATE=template0 LC_COLLATE='en_US.utf8' LC_CTYPE='en_US.utf8';"
    echo "Database 'p_db' created"
fi

echo "Restoring dump..."
pg_restore --clean --if-exists --dbname=p_db --exit-on-error \
  /tmp/mprove-demo-p_db.dump > /tmp/restore.log 2>&1 || {
    echo "ERROR: restore failed"
    echo "Last 30 lines of log:"
    tail -n 30 /tmp/restore.log
    exit 1
}

psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE p_db TO postgres;" || true

echo "dwh-postgres init completed"