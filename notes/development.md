# inside running devcontainer (after devcontainer rebuild completed)

// for claude tool "gh" to work
gh auth login

// cleans pnpm-store, turbo, node_modules, bun, dist
pnpm clean

// cleans mprove_data (except clickstack - for API key to work)
pnpm clean:app

// install
pnpm inst

// check circular deps
pnpm circular

pnpm lint
pnpm build

// creates initial env vars
pnpm create-env

// manually update envs - for tests to work (demo project env vars are also needed)
BACKEND_ALLOW_TEST_ROUTES=TRUE
BACKEND_REGISTER_ONLY_INVITED_USERS=FALSE
BACKEND_ALLOW_USERS_TO_CREATE_ORGANIZATIONS=TRUE

# infra - terminal A (needs to be run outside of devcontainer)

c up -d db valkey calc-postgres dwh-postgres dwh-mysql clickstack opencode

c logs -f db valkey calc-postgres dwh-postgres dwh-mysql clickstack opencode

# inside running devcontainer

pnpm start

// or start each service separately

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

# tests

pnpm test:disk
pnpm test:blockml

// does not need backend to run, but needs migrations to be completed by running "pnpm start:backend"
pnpm e2e:backend

// needs backend to be running
pnpm e2e:mcli

# terminal B (needs to be run outside of devcontainer)

c build backend && \
c build blockml && \
c build chat && \
c build disk && \
c build front && \
c build mcli

c build backend --no-cache && \
c build --no-cache blockml && \
c build --no-cache chat && \
c build --no-cache disk && \
c build --no-cache front && \
c build --no-cache mcli

c up backend blockml disk front chat

# terminal C (needs to be run outside of devcontainer)

// useful commands
docker ps
c exec -it backend bash
c exec -it disk bash
