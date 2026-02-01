FROM node:24.10.0-bookworm

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:$PATH"

WORKDIR /usr/src/app

COPY package.json .
COPY pnpm-lock.yaml .
COPY pnpm-workspace.yaml .

COPY libs/common/package.json libs/common/
COPY libs/node-common/package.json libs/node-common/

RUN pnpm install --frozen-lockfile

COPY mcli mcli/

COPY libs/common libs/common/
COPY libs/node-common libs/node-common/

COPY turbo.json tsconfig.base.json tsconfig.json ./

RUN cd mcli && bun install

RUN pnpm build:mcli

CMD ["sleep", "infinity"]
