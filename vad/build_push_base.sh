#!/usr/bin/env bash

#180724.10

docker build -f docker/base/Dockerfile -t us.gcr.io/mprove-1201/mprove-node-base:180724.10 --no-cache=true .

docker login -u _token -p "$(gcloud auth print-access-token)" https://us.gcr.io
docker push us.gcr.io/mprove-1201/mprove-node-base:180724.10
