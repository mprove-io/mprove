#!/usr/bin/env bash

psql -U postgres -c "CREATE DATABASE p_db"
pg_restore -v -d p_db /tmp/mprove-demo-p_db.dump > /tmp/log
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE p_db TO postgres"