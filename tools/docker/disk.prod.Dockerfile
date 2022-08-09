FROM node:16.15.1

WORKDIR /usr/src/app
RUN npm config set scripts-prepend-node-path true
COPY package.docker.json package.json
COPY yarn.lock .
RUN yarn --frozen-lockfile

COPY apps/disk apps/disk/
COPY libs/api-to-disk libs/api-to-disk/
COPY libs/common libs/common/
COPY ava.config.js ava-js.config.js ava-js-e2e.config.js nx.json package.json tsconfig.base.json tsconfig.json workspace.json ./

RUN yarn build:disk:prod

EXPOSE 3002 9230

CMD [ "node", "dist/apps/disk/main.js" ]