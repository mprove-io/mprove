# syntax = docker/dockerfile:1.4.0
FROM postgres:13.5
VOLUME /tmp

COPY tools/data/mprove-demo-p_db.dump /tmp/mprove-demo-p_db.dump

RUN cat <<EOT >> /docker-entrypoint-initdb.d/restore_database.sh
#!/usr/bin/env bash
psql -U postgres -c "CREATE DATABASE p_db"
pg_restore -v -d p_db /tmp/mprove-demo-p_db.dump > /tmp/log
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE p_db TO postgres"
EOT

RUN chmod 777 /docker-entrypoint-initdb.d/restore_database.sh

EXPOSE 5432
