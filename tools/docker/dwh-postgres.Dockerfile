FROM postgres:13.5
VOLUME /tmp

COPY tools/data/mprove-demo-p_db.dump /tmp/mprove-demo-p_db.dump

RUN echo '#!/usr/bin/env bash' >> /docker-entrypoint-initdb.d/restore_database.sh
RUN echo 'psql -U postgres -c "CREATE DATABASE p_db"' >> /docker-entrypoint-initdb.d/restore_database.sh
RUN echo 'pg_restore -v -d p_db /tmp/mprove-demo-p_db.dump > /tmp/log' >> /docker-entrypoint-initdb.d/restore_database.sh
RUN echo 'psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE p_db TO postgres"' >> /docker-entrypoint-initdb.d/restore_database.sh

RUN chmod 777 /docker-entrypoint-initdb.d/restore_database.sh

EXPOSE 5432
