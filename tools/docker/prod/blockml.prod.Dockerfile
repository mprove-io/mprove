FROM node:16.15.1
WORKDIR /usr/src/app
RUN npm config set scripts-prepend-node-path true
COPY package.docker.json package.json
COPY yarn.lock .
RUN yarn

COPY apps/blockml apps/blockml/
COPY libs/api-to-blockml libs/api-to-blockml/
COPY libs/common libs/common/
COPY nx.json package.json tsconfig.base.json tsconfig.json workspace.json ./

RUN yarn build:blockml:prod

EXPOSE 3001 9231

CMD [ "node", "dist/apps/blockml/main.js" ]