#!/usr/bin/env bash
set -euo pipefail

psql -v ON_ERROR_STOP=1 --username "postgres" --dbname "postgres" <<-EOSQL
    DO \$\$
    BEGIN
        IF EXISTS (SELECT FROM pg_roles WHERE rolname = '$READ_USER') THEN
            RAISE NOTICE 'Role % already exists → updating password only', '$READ_USER';
            ALTER ROLE "$READ_USER" WITH PASSWORD '$READ_PASSWORD';
        ELSE
            CREATE ROLE "$READ_USER"
                LOGIN
                PASSWORD '$READ_PASSWORD'
                NOSUPERUSER
                NOCREATEDB
                NOCREATEROLE
                NOREPLICATION
                NOBYPASSRLS;
            RAISE NOTICE 'Created new read-only role %', '$READ_USER';
        END IF;
    END
    \$\$;

    GRANT CONNECT ON DATABASE p_db TO "$READ_USER";
    GRANT pg_read_all_data TO "$READ_USER";

    REVOKE ALL ON FUNCTION pg_catalog.pg_terminate_backend FROM "$READ_USER";
    REVOKE ALL ON FUNCTION pg_catalog.pg_cancel_backend    FROM "$READ_USER";
    REVOKE ALL ON FUNCTION pg_catalog.pg_stat_get_activity FROM "$READ_USER";

EOSQL

echo "Read-only user '$READ_USER' successfully configured for database 'p_db'"
exit 0