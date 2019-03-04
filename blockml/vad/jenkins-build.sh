#!/usr/bin/env bash

# 180730.2.0

check_fail () {
  if [ "$?" != "0" ]; then
    echo "$1"
    /sbin/slackpost "Docker" "$1" ":skull:"
    exit 1
  fi
}

cat << EOF > .env
BASE_PATH=/mprove/basedir

EOF

./check_free_place.sh
check_fail "lack of *free* space"

yarn
check_fail "yarn *fail*"

yarn build
check_fail "yarn build *fail*"

yarn test
check_fail "yarn tests *fail*"

echo `hostname`: `date` > version.txt && git log | head -n 3 >> version.txt
cat version.txt

echo "$(gcloud auth print-access-token)" | docker login -u _token --password-stdin  https://us.gcr.io
check_fail "gcloud auth *fail*"

docker build -f docker/yarn/Dockerfile -t us.gcr.io/mprove-1201/mprove-blockml-node:latest --no-cache=true .
check_fail "docker build *fail*"

docker push us.gcr.io/mprove-1201/mprove-blockml-node:latest
check_fail "docker push *fail*"

# проверяем, надо ли собирать main образ
imagetag=`cat tag.txt | grep "." | sed 's/\s//g'`
isold=`./tag_list.sh | grep "$imagetag" | wc -l`

echo $imagetag
echo $isold

if [[ $isold != "0" ]]
then
   rm -f .env

   echo "image already exist, exit"
   exit 0
fi

echo "build new main image"
/sbin/slackpost "Docker" "build mprove-blockml-node:$imagetag" ":whale:"

#docker pull us.gcr.io/mprove-1201/mprove-node-base:180724.10

#docker build -f docker/yarn/Dockerfile -t us.gcr.io/mprove-1201/mprove-blockml-node:$imagetag --no-cache=true .
docker image tag us.gcr.io/mprove-1201/mprove-blockml-node:latest us.gcr.io/mprove-1201/mprove-blockml-node:$imagetag
check_fail "docker tag *fail*"

docker push us.gcr.io/mprove-1201/mprove-blockml-node:$imagetag
check_fail "docker push tag *fail*"

/sbin/slackpost "Docker" "done" ":whale:"

rm -f .env

./tag_list2slack.sh

