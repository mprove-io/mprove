FROM node:16.15.1
WORKDIR /usr/src/app
RUN npm config set scripts-prepend-node-path true
COPY package.docker.json package.json
COPY yarn.lock .
RUN yarn
COPY . .
RUN yarn build:disk:prod

EXPOSE 3002 9230

CMD [ "node", "dist/apps/disk/main.js" ]