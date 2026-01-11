#!/bin/bash
set -euo pipefail

psql -v ON_ERROR_STOP=1 --username "postgres" --dbname "postgres" <<-EOSQL
    -- Create or update the restricted calculation user
    DO \$\$
    BEGIN
        CREATE ROLE "$CALC_USER"
            WITH LOGIN
            PASSWORD '$CALC_PASSWORD'
            NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS;
    EXCEPTION WHEN duplicate_object THEN
        ALTER ROLE "$CALC_USER"
            WITH LOGIN
            PASSWORD '$CALC_PASSWORD';
    END
    \$\$;

    GRANT CONNECT ON DATABASE postgres TO "$CALC_USER";

    REVOKE ALL ON SCHEMA public FROM "$CALC_USER";
    REVOKE ALL ON SCHEMA public FROM PUBLIC;

    REVOKE EXECUTE ON FUNCTION pg_catalog.pg_terminate_backend FROM "$CALC_USER";
    REVOKE EXECUTE ON FUNCTION pg_catalog.pg_cancel_backend FROM "$CALC_USER";
    REVOKE EXECUTE ON FUNCTION pg_catalog.pg_stat_get_activity FROM "$CALC_USER";
EOSQL

echo "User '$CALC_USER' created or updated successfully."