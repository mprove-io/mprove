FROM node:14.15.3

WORKDIR /usr/src/app

RUN npm config set scripts-prepend-node-path true

COPY package.docker.json package.json
COPY yarn.lock .

RUN yarn

COPY dist/apps/disk .

EXPOSE 3002

CMD [ "node", "main.js" ]