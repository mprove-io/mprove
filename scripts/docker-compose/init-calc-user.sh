#!/bin/bash
set -euo pipefail

psql -v ON_ERROR_STOP=1 --username "postgres" --dbname "postgres" <<-EOSQL
    DO \$\$
    BEGIN
        IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '$CALC_USER') THEN
            CREATE ROLE "$CALC_USER"
                WITH LOGIN
                PASSWORD '$CALC_PASSWORD'
                NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS;
        END IF;
    END
    \$\$;

    GRANT CONNECT ON DATABASE postgres TO "$CALC_USER";

    REVOKE ALL ON SCHEMA public FROM "$CALC_USER";
    REVOKE ALL ON SCHEMA public FROM PUBLIC;

    REVOKE EXECUTE ON FUNCTION pg_catalog.pg_terminate_backend FROM "$CALC_USER";
    REVOKE EXECUTE ON FUNCTION pg_catalog.pg_cancel_backend FROM "$CALC_USER";
    REVOKE EXECUTE ON FUNCTION pg_catalog.pg_stat_get_activity FROM "$CALC_USER";
EOSQL

echo "User '$CALC_USER' created successfully."