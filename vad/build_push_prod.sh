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
docker build -f docker/yarn/Dockerfile -t us.gcr.io/mprove-1201/mprove-blockml-node:latest --no-cache=true .

docker login -u _token -p "$(gcloud auth print-access-token)" https://us.gcr.io
docker push us.gcr.io/mprove-1201/mprove-blockml-node:latest
