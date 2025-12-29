FROM mysql:8.4.6

VOLUME /tmp

COPY tools/data/dwh-mysql-schema.sql /tmp/dwh-mysql-schema.sql
COPY tools/data/csv/*.csv /var/lib/mysql-files/

COPY scripts/docker/dwh-mysql-init.sh /docker-entrypoint-initdb.d/dwh-mysql-init.sh
RUN chmod +x /docker-entrypoint-initdb.d/dwh-mysql-init.sh

EXPOSE 3306