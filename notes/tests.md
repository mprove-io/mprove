yarn clean:mprove_data
yarn create-env

BACKEND_ALLOW_TEST_ROUTES=TRUE
BACKEND_REGISTER_ONLY_INVITED_USERS=FALSE
BACKEND_ALLOW_USERS_TO_CREATE_ORGANIZATIONS=TRUE

scripts/dc.sh db rabbit valkey calc-postgres dwh-postgres dwh-mysql

yarn serve:disk
yarn serve:blockml

# runs migrations

yarn serve:backend

serve:front:dev

yarn test:disk --skip-nx-cache
yarn test:blockml --skip-nx-cache

# does not connect to backend (yarn serve:backend)

yarn e2e:backend --skip-nx-cache

# connects to backend (yarn serve:backend)

yarn e2e:mcli --skip-nx-cache
