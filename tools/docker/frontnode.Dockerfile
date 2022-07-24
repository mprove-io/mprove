FROM node:16.15.1
WORKDIR /usr/src/app
RUN npm config set scripts-prepend-node-path true
COPY package.docker.json package.json
COPY yarn.lock .
RUN yarn
COPY . .

EXPOSE 4200

CMD ["yarn", "serve:front:dev"]

