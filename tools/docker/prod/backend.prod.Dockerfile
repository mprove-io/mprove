FROM node:16.15.1
WORKDIR /usr/src/app
RUN npm config set scripts-prepend-node-path true
COPY package.docker.json package.json
COPY yarn.lock .
RUN yarn

COPY apps/backend apps/backend/
COPY apps/blockml apps/blockml/
COPY apps/disk apps/disk/
COPY libs/api-to-backend libs/api-to-backend/
COPY libs/api-to-disk libs/api-to-disk/
COPY libs/api-to-blockml libs/api-to-blockml/
COPY libs/common libs/common/
COPY ava.config.js ava-js.config.js ava-js-e2e.config.js nx.json package.json tsconfig.base.json tsconfig.json workspace.json ./

RUN yarn build:backend:prod

EXPOSE 3000 9229

CMD [ "node", "dist/apps/backend/main.js" ]