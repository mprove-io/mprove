#!/usr/bin/env bash


############################## NEW ##############################

#
# from m-common ESLINT
#

cp -rf m-common/eslint/.eslintrc.js m-common/ts/.eslintrc.js
cp -rf m-common/eslint/.eslintrc.js m-backend/.eslintrc.js
cp -rf m-common/eslint/.eslintrc.js m-disk/.eslintrc.js
cp -rf m-common/eslint/.eslintrc.js m-blockml/.eslintrc.js

#
# from m-common PRETTIER
#

# to root
cp -rf m-common/prettier/.prettierrc.yaml .prettierrc.yaml
cp -rf m-common/prettier/.prettierrc.yaml m-common/ts/.prettierrc.yaml
cp -rf m-common/prettier/.prettierrc.yaml m-backend/.prettierrc.yaml
cp -rf m-common/prettier/.prettierrc.yaml m-disk/.prettierrc.yaml
cp -rf m-common/prettier/.prettierrc.yaml m-blockml/.prettierrc.yaml

#
# from m-common TS
#

rm -rf m-backend/src/api
mkdir m-backend/src/api
cp -rf m-common/ts/src/api/ m-backend/src/api

rm -rf m-disk/src/api
mkdir m-disk/src/api
cp -rf m-common/ts/src/api/ m-disk/src/api

rm -rf m-blockml/src/api
mkdir m-blockml/src/api
cp -rf m-common/ts/src/api/ m-blockml/src/api

############################## OLD ##############################

#
# from common TSLINT
#

# to api
cp -rf common/tslint/tslint-base.json common/api/tslint-base.json

# to backend
cp -rf common/tslint/tslint-base.json backend/tslint-base.json

# to blockml
cp -rf common/tslint/tslint-base.json blockml/tslint-base.json

# to client
cp -rf common/tslint/tslint-base.json client/tslint-base.json
cp -rf common/tslint/tslint-codelyzer.json client/tslint-codelyzer.json

#
# from common API
#

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