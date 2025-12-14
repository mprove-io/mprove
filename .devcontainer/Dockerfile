# https://github.com/devcontainers/images/tree/main/src/javascript-node/history
# previous node -v (20.18.1) https://github.com/devcontainers/images/blob/main/src/javascript-node/history/1.1.8.md#variant-20-bullseye
# ARG VARIANT=1.1.9-20-bullseye
# current node -v (20.19.0) https://github.com/devcontainers/images/blob/main/src/javascript-node/history/1.1.9.md#variant-20-bookworm
ARG VARIANT=1.1.9-20-bookworm
FROM mcr.microsoft.com/vscode/devcontainers/javascript-node:${VARIANT}

RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
    libgtk2.0-0 \
    libgtk-3-0 \
    libgbm-dev \
    libnotify-dev \
    libgconf-2-4 \
    libnss3 \
    libxss1 \
    libasound2 \
    libxtst6 \
    xauth \
    xvfb

# direnv
RUN apt-get install -y direnv
RUN apt-get install -y sqlite3

RUN chsh -s /bin/zsh root \
  && chsh -s /bin/zsh node    

