#!/usr/bin/env bash

# mprove-node
rm -rf /Users/akalitenya/mprove-node/src/api
mkdir /Users/akalitenya/mprove-node/src/api
cp -rf /Users/akalitenya/mprove-api/src/ /Users/akalitenya/mprove-node/src/api

cp -rf /Users/akalitenya/mprove-api/.prettierrc.yaml /Users/akalitenya/mprove-node/.prettierrc.yaml
cp -rf /Users/akalitenya/mprove-api/tslint-base.json /Users/akalitenya/mprove-node/tslint-base.json

# mprove-blockml-node
rm -rf /Users/akalitenya/mprove-blockml-node/src/api
mkdir /Users/akalitenya/mprove-blockml-node/src/api
cp -rf /Users/akalitenya/mprove-api/src/ /Users/akalitenya/mprove-blockml-node/src/api

cp -rf /Users/akalitenya/mprove-api/.prettierrc.yaml /Users/akalitenya/mprove-blockml-node/.prettierrc.yaml
cp -rf /Users/akalitenya/mprove-api/tslint-base.json /Users/akalitenya/mprove-blockml-node/tslint-base.json

# mprove-web-app
rm -rf /Users/akalitenya/mprove-web-app/src/app/api
mkdir /Users/akalitenya/mprove-web-app/src/app/api
cp -rf /Users/akalitenya/mprove-api/src/ /Users/akalitenya/mprove-web-app/src/app/api

cp -rf /Users/akalitenya/mprove-api/.prettierrc.yaml /Users/akalitenya/mprove-web-app/.prettierrc.yaml
cp -rf /Users/akalitenya/mprove-api/tslint-base.json /Users/akalitenya/mprove-web-app/tslint-base.json
cp -rf /Users/akalitenya/mprove-api/tslint-codelyzer.json /Users/akalitenya/mprove-web-app/tslint-codelyzer.json

# mprove-docs-app
cp -rf /Users/akalitenya/mprove-api/.prettierrc.yaml /Users/akalitenya/mprove-docs-app/.prettierrc.yaml
cp -rf /Users/akalitenya/mprove-api/tslint-base.json /Users/akalitenya/mprove-docs-app/tslint-base.json
cp -rf /Users/akalitenya/mprove-api/tslint-codelyzer.json /Users/akalitenya/mprove-docs-app/tslint-codelyzer.json