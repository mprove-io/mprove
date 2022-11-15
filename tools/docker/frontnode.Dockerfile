FROM node:16.18.0 AS builder

WORKDIR /usr/src/app
RUN npm config set scripts-prepend-node-path true
COPY package.docker.json package.json
COPY yarn.lock .
RUN yarn --frozen-lockfile

COPY apps/backend apps/backend/
COPY apps/disk apps/disk/
COPY apps/blockml apps/blockml/
COPY apps/integra apps/integra/
COPY libs/api-to-disk libs/api-to-disk/
COPY libs/api-to-blockml libs/api-to-blockml/
COPY libs/node-common libs/node-common/

COPY apps/front apps/front/
COPY libs/api-to-backend libs/api-to-backend/
COPY libs/common libs/common/
COPY nx.json package.json tsconfig.base.json tsconfig.json workspace.json ./

EXPOSE 4200

CMD ["yarn", "serve:front:dev:host"]
