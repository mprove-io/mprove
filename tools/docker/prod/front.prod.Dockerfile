FROM node:14.15.3 AS builder
WORKDIR /usr/src/app
RUN npm config set scripts-prepend-node-path true
COPY package.json .
COPY yarn.lock .
RUN yarn
COPY . .
RUN yarn build:front:prod

FROM nginx:1.21.1
COPY --from=builder /usr/src/app/apps/front/nginx-configs/nginx.front.conf /etc/nginx/nginx.conf
COPY --from=builder /usr/src/app/dist/apps/front /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]