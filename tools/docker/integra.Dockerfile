FROM cypress/browsers:node16.14.0-chrome99-ff97

WORKDIR /usr/src/app
RUN npm config set scripts-prepend-node-path true
COPY package.docker.json package.json
COPY yarn.lock .
RUN yarn --frozen-lockfile

COPY apps/front-e2e apps/front-e2e/
COPY libs/api-to-backend libs/api-to-backend/
COPY libs/api-to-disk libs/api-to-disk/
COPY libs/common libs/common/
COPY nx.json package.json tailwind.config.js tsconfig.base.json tsconfig.json workspace.json ./

CMD ["sleep", "infinity"]

