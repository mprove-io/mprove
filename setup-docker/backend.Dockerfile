FROM node:24.10.0-bookworm

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /usr/src/app

COPY package.docker.json package.json
COPY pnpm-lock.yaml .
COPY pnpm-workspace.yaml .

RUN pnpm install --frozen-lockfile

COPY scripts/wait-for-it.sh scripts/wait-for-it.sh

COPY apps/backend apps/backend/

COPY libs/common libs/common/
COPY libs/node-common libs/node-common/

COPY ava.config.js ava-js.config.js ava-js-e2e.config.js turbo.json package.json tsconfig.base.json tsconfig.json ./

RUN chmod +x scripts/wait-for-it.sh
RUN pnpm build:backend:prod

EXPOSE 3000

CMD [ "node", "apps/backend/dist/main.js" ]