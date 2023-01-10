FROM gristlabs/grist:1.0.6

RUN \
  apt-get update && \
  apt-get install -y --no-install-recommends sqlite3 && \
  rm -rf /var/lib/apt/lists/*

COPY scripts/grist-init.sh .
RUN chmod 777 ./grist-init.sh

EXPOSE 8484

CMD ./grist-init.sh & ./sandbox/run.sh

