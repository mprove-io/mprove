#!/usr/bin/env bash

tag=`cat tag.txt`

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
docker build -f docker/yarn/Dockerfile -t us.gcr.io/mprove-1201/mprove-blockml-node:$tag --no-cache=true .
if [ "$?" != "0" ]; then
    echo "BUILD FAIL!! exit"
    exit 1
fi

docker push us.gcr.io/mprove-1201/mprove-blockml-node:$tag
if [ "$?" != "0" ]; then
    echo "PUSH FAIL!! exit"
    exit 1
fi
