#!/usr/bin/env bash

# mprove/backend
rm -rf /Users/akalitenya/mprove/backend/src/api
mkdir /Users/akalitenya/mprove/backend/src/api
cp -rf /Users/akalitenya/mprove-api/src/ /Users/akalitenya/mprove/backend/src/api

# mprove/blockml
rm -rf /Users/akalitenya/mprove/blockml/src/api
mkdir /Users/akalitenya/mprove/blockml/src/api
cp -rf /Users/akalitenya/mprove-api/src/ /Users/akalitenya/mprove/blockml/src/api

# mprove/client
rm -rf /Users/akalitenya/mprove/client/src/app/api
mkdir /Users/akalitenya/mprove/client/src/app/api
cp -rf /Users/akalitenya/mprove-api/src/ /Users/akalitenya/mprove/client/src/app/api