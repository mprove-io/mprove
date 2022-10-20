werf helm secret file encrypt secrets/bigquery-test.json -o .helm/secret/bigquery-test.json \
  && werf helm secret file encrypt secrets/first-project-remote-private-key.pem -o .helm/secret/first-project-remote-private-key.pem \
  && werf helm secret file encrypt secrets/first-project-remote-public-key.pem -o .helm/secret/first-project-remote-public-key.pem