FROM node:20.19.0-bullseye AS builder

WORKDIR /usr/src/app
# RUN npm config set scripts-prepend-node-path true
COPY package.docker.json package.json
COPY yarn.lock .
RUN yarn --frozen-lockfile

COPY apps/front apps/front/

COPY libs/common libs/common/

COPY nx.json package.json tsconfig.base.json tsconfig.json ./

RUN yarn build:front:prod

FROM nginx:1.21.1
COPY --from=builder /usr/src/app/apps/front/nginx-configs/nginx.front.conf /etc/nginx/nginx.conf
COPY --from=builder /usr/src/app/dist/apps/front /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
