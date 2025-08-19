FROM node:20.19.0-bullseye

WORKDIR /usr/src/app
# RUN npm config set scripts-prepend-node-path true
COPY package.docker.json package.json
COPY yarn.lock .
RUN yarn --frozen-lockfile

COPY scripts/wait-for-it.sh scripts/wait-for-it.sh

COPY apps/disk apps/disk/

COPY libs/common libs/common/
COPY libs/node-common libs/node-common/

COPY ava.config.js ava-js.config.js ava-js-e2e.config.js nx.json package.json tsconfig.base.json tsconfig.json ./

RUN chmod +x scripts/wait-for-it.sh
RUN yarn build:disk:prod

EXPOSE 3002 9229

CMD [ "node", "dist/apps/disk/main.js" ]