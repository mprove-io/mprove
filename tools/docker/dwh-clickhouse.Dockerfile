FROM yandex/clickhouse-server:21.11.7.9

VOLUME /tmp
COPY tools/data/csv /tmp/csv/

COPY sh/dwh-clickhouse-init.sh /docker-entrypoint-initdb.d/dwh-clickhouse-init.sh

EXPOSE 8123 9000
