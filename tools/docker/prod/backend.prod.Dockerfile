FROM node:14.15.3
WORKDIR /usr/src/app
RUN npm config set scripts-prepend-node-path true
COPY package.docker.json package.json
COPY yarn.lock .
RUN yarn
COPY . .
RUN yarn build:backend:prod

EXPOSE 3000 9229

CMD [ "node", "dist/apps/backend/main.js" ]