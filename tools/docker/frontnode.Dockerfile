FROM node:20.19.5-bookworm

WORKDIR /usr/src/app
# RUN npm config set scripts-prepend-node-path true
COPY package.docker.json package.json
COPY pnpm-lock.yaml .
RUN pnpm install --frozen-lockfile

COPY apps/front apps/front/

COPY libs/common libs/common/

COPY nx.json package.json tsconfig.base.json tsconfig.json ./

EXPOSE 4200

CMD ["pnpm", "serve:front:dev:host"]
