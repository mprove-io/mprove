#!/usr/bin/env bash

yarn
yarn build
yarn test

if [ "$?" != "0" ]; then
    echo "TESTS FAIL!! exit without push"
    exit 1
else
    echo "TESTS OK"
fi

echo `hostname`: `date` > version.txt && git log | head -n 3 >> version.txt
docker build -t us.gcr.io/mprove-1201/mprove-blockml-node:latest -f docker/yarn/Dockerfile --no-cache=true .
sleep 10
docker run -it --rm -p 8001:8080 us.gcr.io/mprove-1201/mprove-blockml-node:latest
