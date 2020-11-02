#!/usr/bin/env bash


############################## NEW ##############################

#
# from m-common ESLINT
#

# to m-common/api
cp -rf m-common/eslint/.eslintrc.js m-common/api/.eslintrc.js

# to m-backend
cp -rf m-common/eslint/.eslintrc.js m-backend/.eslintrc.js

# to m-disk
cp -rf m-common/eslint/.eslintrc.js m-disk/.eslintrc.js

# to m-blockml
cp -rf m-common/eslint/.eslintrc.js m-blockml/.eslintrc.js

#
# from m-common PRETTIER
#

# to root
cp -rf m-common/prettier/.prettierrc.yaml .prettierrc.yaml

# to m-common/api
cp -rf m-common/prettier/.prettierrc.yaml m-common/api/.prettierrc.yaml

# to m-backend
cp -rf m-common/prettier/.prettierrc.yaml m-backend/.prettierrc.yaml

# to m-disk
cp -rf m-common/prettier/.prettierrc.yaml m-disk/.prettierrc.yaml

# to m-blockml
cp -rf m-common/prettier/.prettierrc.yaml m-blockml/.prettierrc.yaml

#
# from m-common API
#

# to m-backend
rm -rf m-backend/src/api
mkdir m-backend/src/api
cp -rf m-common/api/src/ m-backend/src/api

# to m-disk
rm -rf m-disk/src/api
mkdir m-disk/src/api
cp -rf m-common/api/src/ m-disk/src/api

# to m-blockml
rm -rf m-blockml/src/api
mkdir m-blockml/src/api
cp -rf m-common/api/src/ m-blockml/src/api

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