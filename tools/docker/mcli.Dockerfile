FROM node:20.19.5-bookworm

WORKDIR /usr/src/app
# RUN npm config set scripts-prepend-node-path true
COPY package.docker.json package.json
COPY yarn.lock .
RUN yarn --frozen-lockfile

COPY apps/mcli apps/mcli/

COPY libs/common libs/common/
COPY libs/node-common libs/node-common/

COPY ava.config.js ava-js.config.js ava-js-e2e.config.js nx.json package.json tsconfig.base.json tsconfig.json ./

COPY package.cli.json .

ENV NX_DAEMON=false

RUN yarn build:mcli
RUN yarn build-tests:mcli

RUN rm -rf node_modules

COPY package.cli.json package.json
RUN yarn --frozen-lockfile

CMD ["sleep", "infinity"]