FROM node:14.15.3

RUN apt-get update && apt-get install -y wget

ENV DOCKERIZE_VERSION v0.6.1
RUN wget https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
  && tar -C /usr/local/bin -xzvf dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
  && rm dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz

WORKDIR /usr/src/app

RUN npm config set scripts-prepend-node-path true

COPY package.docker.json package.json
COPY yarn.lock .

RUN yarn

COPY dist/apps/backend .

EXPOSE 3000

# CMD [ "node", "main.js" ]
CMD dockerize -wait tcp://db:3306 -timeout 2m node main.js