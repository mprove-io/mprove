#!/usr/bin/env bash

imagetag=`cat tag.txt | grep "." | sed 's/\s//g'`
isold=`./tag_list.sh | grep "imagetag" | wc -l`

echo $imagetag
echo $isold

if [[ $isold != "0" ]]
then
   echo "image already exist, exit"
   exit 0
fi

echo "build new main image"

echo "$(gcloud auth print-access-token)" | docker login -u _token --password-stdin  https://us.gcr.io
docker build -f docker/yarn/Dockerfile -t us.gcr.io/mprove-1201/mprove-blockml-node:$imagetag --no-cache=true .
docker push us.gcr.io/mprove-1201/mprove-blockml-node:$imagetag
