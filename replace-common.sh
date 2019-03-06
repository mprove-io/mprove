#!/usr/bin/env bash

# from common TSLINT

# to api
cp -rf common/tslint/tslint-base.json common/api/tslint-base.json

# to backend
cp -rf common/tslint/tslint-base.json backend/tslint-base.json

# to blockml
cp -rf common/tslint/tslint-base.json blockml/tslint-base.json

# to client
cp -rf common/tslint/tslint-base.json client/tslint-base.json
cp -rf common/tslint/tslint-codelyzer.json client/tslint-codelyzer.json


# from common API

# to backend
rm -rf backend/src/api
mkdir backend/src/api
cp -rf common/api/src/ backend/src/api

# to blockml
rm -rf blockml/src/api
mkdir blockml/src/api
cp -rf common/api/src/ blockml/src/api

# to client
rm -rf client/src/app/api
mkdir client/src/app/api
cp -rf common/api/src/ client/src/app/api