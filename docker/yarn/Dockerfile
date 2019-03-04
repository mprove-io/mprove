FROM us.gcr.io/mprove-1201/mprove-node-base:180724.10

#180804.1

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY . .

# replace this with your application's default port
EXPOSE 8080

#CMD [ "yarn", "start" ]
CMD [ "yarn", "serve" ]

