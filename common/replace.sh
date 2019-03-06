#!/usr/bin/env bash

# from common TSLINT

# to api
cp -rf /Users/akalitenya/mprove/common/tslint/tslint-base.json /Users/akalitenya/mprove/common/api/tslint-base.json

# to backend
cp -rf /Users/akalitenya/mprove/common/tslint/tslint-base.json /Users/akalitenya/mprove/backend/tslint-base.json

# to blockml
cp -rf /Users/akalitenya/mprove/common/tslint/tslint-base.json /Users/akalitenya/mprove/blockml/tslint-base.json

# to client
cp -rf /Users/akalitenya/mprove/common/tslint/tslint-base.json /Users/akalitenya/mprove/client/tslint-base.json
cp -rf /Users/akalitenya/mprove/common/tslint/tslint-codelyzer.json /Users/akalitenya/mprove/client/tslint-codelyzer.json


# from common API

# to backend
rm -rf /Users/akalitenya/mprove/backend/src/api
mkdir /Users/akalitenya/mprove/backend/src/api
cp -rf /Users/akalitenya/mprove/common/api/src/ /Users/akalitenya/mprove/backend/src/api

# to blockml
rm -rf /Users/akalitenya/mprove/blockml/src/api
mkdir /Users/akalitenya/mprove/blockml/src/api
cp -rf /Users/akalitenya/mprove/common/api/src/ /Users/akalitenya/mprove/blockml/src/api

# to client
rm -rf /Users/akalitenya/mprove/client/src/app/api
mkdir /Users/akalitenya/mprove/client/src/app/api
cp -rf /Users/akalitenya/mprove/common/api/src/ /Users/akalitenya/mprove/client/src/app/api