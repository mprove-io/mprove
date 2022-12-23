FROM node:16.19.0 AS builder

WORKDIR /usr/src/app
RUN npm config set scripts-prepend-node-path true
COPY package.docker.json package.json
COPY yarn.lock .
RUN yarn --frozen-lockfile

COPY apps/front apps/front/

COPY libs/api-to-backend libs/api-to-backend/
COPY libs/common libs/common/

COPY nx.json package.json tsconfig.base.json tsconfig.json ./

EXPOSE 4200

CMD ["yarn", "serve:front:dev:host"]
