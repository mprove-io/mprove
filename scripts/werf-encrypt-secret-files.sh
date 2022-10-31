werf helm secret file encrypt secrets/typeorm-datasource.ts -o .helm/secret/typeorm-datasource.ts \
  && werf helm secret file encrypt secrets/first-project-bigquery-credentials.json -o .helm/secret/first-project-bigquery-credentials.json \
  && werf helm secret file encrypt secrets/first-project-remote-private-key.pem -o .helm/secret/first-project-remote-private-key.pem \
  && werf helm secret file encrypt secrets/first-project-remote-public-key.pem -o .helm/secret/first-project-remote-public-key.pem