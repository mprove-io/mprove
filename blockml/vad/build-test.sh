#!/usr/bin/env bash

check_fail () {
  if [ "$?" != "0" ]; then
    echo "$1"
    exit 1
  fi
}

yarn
check_fail "yarn *fail*"

yarn build
check_fail "yarn build *fail*"

yarn test
check_fail "yarn tests *fail*"

echo `hostname`: `date` > version.txt && git log | head -n 3 >> version.txt
docker build -t us.gcr.io/mprove-1201/mprove-blockml-node:latest -f docker/yarn/Dockerfile --no-cache=true .
check_fail "docker build *fail*"

