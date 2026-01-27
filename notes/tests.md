pnpm clean:mprove_data
pnpm create-env

BACKEND_ALLOW_TEST_ROUTES=TRUE
BACKEND_REGISTER_ONLY_INVITED_USERS=FALSE
BACKEND_ALLOW_USERS_TO_CREATE_ORGANIZATIONS=TRUE

scripts/dc.sh db valkey calc-postgres dwh-postgres dwh-mysql

pnpm serve:disk
pnpm serve:blockml

# runs migrations

pnpm serve:backend

serve:front:dev

pnpm test:disk
pnpm test:blockml

# does not connect to backend (pnpm serve:backend)

pnpm e2e:backend

# connects to backend (pnpm serve:backend)

pnpm e2e:mcli
