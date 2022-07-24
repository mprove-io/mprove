FROM node:16.15.1
WORKDIR /usr/src/app
RUN npm config set scripts-prepend-node-path true
COPY package.docker.json package.json
COPY yarn.lock .
RUN yarn
COPY . .
RUN yarn build:blockml:prod

EXPOSE 3001 9231

CMD [ "node", "dist/apps/blockml/main.js" ]