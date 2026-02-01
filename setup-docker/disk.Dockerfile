FROM node:24.10.0-bookworm

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /usr/src/app

COPY package.json .
COPY pnpm-lock.yaml .
COPY pnpm-workspace.yaml .

COPY apps/disk/package.json apps/disk/
COPY libs/common/package.json libs/common/
COPY libs/node-common/package.json libs/node-common/

RUN pnpm install --frozen-lockfile

COPY scripts/wait-for-it.sh scripts/wait-for-it.sh

COPY apps/disk apps/disk/

COPY libs/common libs/common/
COPY libs/node-common libs/node-common/

COPY turbo.json tsconfig.base.json tsconfig.json ./

RUN chmod +x scripts/wait-for-it.sh
RUN pnpm build:disk

CMD [ "node", "apps/disk/dist/main.js" ]