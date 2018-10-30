#!/usr/bin/env bash

# mprove-node
rm -rf /Users/akalitenya/mprove-node/src/api
mkdir /Users/akalitenya/mprove-node/src/api

cp -rf /Users/akalitenya/mprove-api/src/ /Users/akalitenya/mprove-node/src/api

# mprove-blockml-node
rm -rf /Users/akalitenya/mprove-blockml-node/src/api
mkdir /Users/akalitenya/mprove-blockml-node/src/api

cp -rf /Users/akalitenya/mprove-api/src/ /Users/akalitenya/mprove-blockml-node/src/api

# mprove-app
rm -rf /Users/akalitenya/mprove-app/src/app/api
mkdir /Users/akalitenya/mprove-app/src/app/api

cp -rf /Users/akalitenya/mprove-api/src/ /Users/akalitenya/mprove-app/src/app/api