FROM node:8.9.1
MAINTAINER vad babushkin <vad.babushkin@gmail.com>
ENV REFRESHED_AT "2018–07–24"

#180724.10

#RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - \
#&& echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list \

RUN apt-get update && apt-get install -y mc apt-transport-https \
&& curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - \
&& echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list \
&& apt-get update && apt-get install -y yarn git-all \
&& npm install typescript -g \
&& rm -rf /var/lib/apt/lists/*

# Create app directory
#RUN mkdir -p /usr/src/app
#WORKDIR /usr/src/app

## Install app dependencies
#COPY [".env", "package.json", "package-lock.json", "todos.ts", "tsconfig.json", "tslint.json", "yarn.lock", "version.txt", "/usr/src/app/"]
#COPY dist/* /usr/src/app/dist/
#COPY node_modules/* /usr/src/app/node_modules/
#COPY src/* /usr/src/app/src/

#COPY . .

#RUN npm install --global yarn typescript && yarn && yarn build

# replace this with your application's default port
#EXPOSE 8080

#CMD [ "yarn", "start" ]

