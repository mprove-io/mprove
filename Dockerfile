FROM node:10.15.0-jessie

WORKDIR /usr/src/app

RUN npm config set scripts-prepend-node-path true

COPY package.json ./
COPY yarn.lock ./

RUN yarn

COPY . .

RUN yarn build

EXPOSE 8080

CMD [ "yarn", "server" ]