FROM postgres:18.1

VOLUME /tmp

COPY setup-docker/data/mprove-demo-p_db.dump /tmp/mprove-demo-p_db.dump
COPY scripts/docker/dwh-postgres-init.sh /docker-entrypoint-initdb.d/01-dwh-postgres-init.sh
COPY scripts/docker/init-dwh-postgres-read-user.sh /docker-entrypoint-initdb.d/02-init-dwh-postgres-read-user.sh

RUN chmod 777 /docker-entrypoint-initdb.d/01-dwh-postgres-init.sh
RUN chmod 777 /docker-entrypoint-initdb.d/02-init-dwh-postgres-read-user.sh

EXPOSE 5436
