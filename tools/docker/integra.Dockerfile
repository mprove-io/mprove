# FROM cypress/browsers:node16.14.0-chrome99-ff97
FROM cypress/browsers:node-18.20.3-chrome-125.0.6422.141-1-ff-126.0.1-edge-125.0.2535.85-1

WORKDIR /usr/src/app
# RUN npm config set scripts-prepend-node-path true
COPY package.docker.json package.json
COPY yarn.lock .
RUN yarn --frozen-lockfile

COPY apps/integra apps/integra/

COPY libs/common libs/common/

COPY nx.json package.json tsconfig.base.json tsconfig.json ./

CMD ["sleep", "infinity"]

