#!/usr/bin/env bash

cat << EOF > .env
BASE_PATH=/mprove/basedir

EOF

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
cat version.txt

echo "$(gcloud auth print-access-token)" | docker login -u _token --password-stdin  https://us.gcr.io

docker build -f docker/yarn/Dockerfile -t us.gcr.io/mprove-1201/mprove-blockml-node:latest --no-cache=true .

rm -f .env