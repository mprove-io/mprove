FROM node:8
MAINTAINER vad babushkin <vad.babushkin@gmail.com>
ENV REFRESHED_AT "2017–10–12"

RUN npm install --global yarn tsc \
&& apt-get update && apt-get install -y mc \
&& rm -rf /var/lib/apt/lists/*

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY . /usr/src/app/

RUN npm install

# replace this with your application's default port
EXPOSE 8080

CMD [ "npm", "start" ]
