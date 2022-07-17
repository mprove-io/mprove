FROM node:14.15.3
WORKDIR /usr/src/app
RUN npm config set scripts-prepend-node-path true
COPY package.json .
COPY yarn.lock .
RUN yarn
COPY . .
RUN yarn build:disk:prod

EXPOSE 3002

CMD [ "node", "dist/apps/disk/main.js" ]