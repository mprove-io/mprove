// id devcontainer rebuild completed
// for claude tool gh to work
gh auth login

// cleans pnpm-store, turbo, node_modules
pnpm clean

// cleans mprove_data (except clickstack - for API key to work)
pnpm clean:app

pnpm install

// check circular deps
pnpm circular

pnpm lint
pnpm build:prod

// creates initial env vars
pnpm create-env

// for tests to work (demo project env vars are also needed)
BACKEND_ALLOW_TEST_ROUTES=TRUE
BACKEND_REGISTER_ONLY_INVITED_USERS=FALSE
BACKEND_ALLOW_USERS_TO_CREATE_ORGANIZATIONS=TRUE

// demo project env vars might also be needed

// infra (needs to be run outside of devcontainer)
scripts/dc.sh db valkey calc-postgres dwh-postgres dwh-mysql clickstack opencode

pnpm start:disk
pnpm start:blockml

// needs disk to be running
// needs blockml to be running
// runs migrations if env BACKEND_IS_SCHEDULER=TRUE
// wait up to 60 seconds for seed to completed if demo project env vars set
// [SCHEDULER] Info 1/31/2026, 12:52:42 PM [NestApplication] Nest application successfully started
// [SCHEDULER] Info 1/31/2026, 12:52:43 PM NODE_ENV "production", BACKEND_ENV "PROD"
pnpm start:backend

// needs disk to be running
// needs blockml to be running
// needs backend to be running
pnpm start:front

pnpm test:disk
pnpm test:blockml

// does not need backend to run, but needs migrations to be completed by "pnpm start:backend"
pnpm e2e:backend

// needs backend to be running
pnpm e2e:mcli
