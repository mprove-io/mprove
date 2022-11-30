FROM node:16.18.0

WORKDIR /usr/src/app
RUN npm config set scripts-prepend-node-path true
COPY package.docker.json package.json
COPY yarn.lock .
RUN yarn --frozen-lockfile

COPY scripts/wait-for-it.sh scripts/wait-for-it.sh

COPY apps/backend apps/backend/

COPY libs/api-to-backend libs/api-to-backend/
COPY libs/api-to-disk libs/api-to-disk/
COPY libs/api-to-blockml libs/api-to-blockml/
COPY libs/common libs/common/
COPY libs/node-common libs/node-common/

COPY ava.config.js ava-js.config.js ava-js-e2e.config.js nx.json package.json tsconfig.base.json tsconfig.json ./

RUN chmod +x scripts/wait-for-it.sh
RUN yarn build:backend:prod

EXPOSE 3000 9229

CMD [ "node", "dist/apps/backend/main.js" ]