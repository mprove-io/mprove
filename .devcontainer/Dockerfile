# [Choice] Node.js version (use -bullseye variants on local arm64/Apple Silicon): 18, 16, 14, 18-bullseye, 16-bullseye, 14-bullseye, 18-buster, 16-buster, 14-buster
ARG VARIANT=14-bullseye
FROM mcr.microsoft.com/vscode/devcontainers/javascript-node:0-${VARIANT}

RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends libgtk2.0-0 libgtk-3-0 libgbm-dev libnotify-dev libgconf-2-4 libnss3 libxss1 libasound2 libxtst6 xauth xvfb

# [Optional] Uncomment if you want to install an additional version of node using nvm
# ARG EXTRA_NODE_VERSION=10
# RUN su node -c "source /usr/local/share/nvm/nvm.sh && nvm install ${EXTRA_NODE_VERSION}"

# [Optional] Uncomment if you want to install more global node packages
# RUN su node -c "npm install -g <your-package-list -here>"

ENV OKTETO_VERSION 2.4.1

RUN curl -sLf --retry 3 -o okteto https://github.com/okteto/okteto/releases/download/${OKTETO_VERSION}/okteto-Linux-x86_64 && \
    cp okteto /usr/local/bin/okteto && \
    chmod +x /usr/local/bin/okteto && \
    /usr/local/bin/okteto version

RUN chsh -s /bin/zsh root \
  && chsh -s /bin/zsh node    

