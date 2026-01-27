FROM node:24.10.0-bookworm

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /usr/src/app

COPY package.docker.json package.json
COPY pnpm-lock.yaml .
COPY pnpm-workspace.yaml .

RUN pnpm install --frozen-lockfile

COPY apps/mcli apps/mcli/

COPY libs/common libs/common/
COPY libs/node-common libs/node-common/

COPY ava.config.js ava-js.config.js ava-js-e2e.config.js turbo.json package.json tsconfig.base.json tsconfig.json ./

RUN pnpm build:mcli
RUN pnpm --filter @mprove/mcli build-tests

# WORKDIR /usr/src/app/apps/mcli

# RUN pnpm install --frozen-lockfile

# WORKDIR /usr/src/app/dist/apps/mcli

# RUN pnpm install --frozen-lockfile

CMD ["sleep", "infinity"]