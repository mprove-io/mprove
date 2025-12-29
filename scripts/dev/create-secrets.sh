mkdir secrets && \
mkdir secrets/presto && \
mkdir secrets/presto/catalog && \
mkdir secrets/trino && \
mkdir secrets/trino/catalog && \
echo {} > secrets/demo-project-bigquery-credentials.json && \
echo '' > secrets/demo-project-remote-private-key-encrypted.pem && \
echo '' > secrets/demo-project-remote-public-key.pem && \
echo '' > secrets/presto/catalog/pgs.properties && \
echo '' > secrets/presto/config.properties && \
echo '' > secrets/trino/catalog/pgs.properties && \
echo '' > secrets/trino/config.properties