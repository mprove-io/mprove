FROM postgres:17.6

VOLUME /tmp
COPY tools/data/mprove-demo-p_db.dump /tmp/mprove-demo-p_db.dump

COPY scripts/dwh-postgres-init.sh /docker-entrypoint-initdb.d/dwh-postgres-init.sh
RUN chmod 777 /docker-entrypoint-initdb.d/dwh-postgres-init.sh

EXPOSE 5436
