# https://github.com/devcontainers/images/tree/main/src/javascript-node/history

# previous node -v (20.19.0) https://github.com/devcontainers/images/blob/main/src/javascript-node/history/1.1.9.md#variant-20-bookworm
# previous ARG VARIANT=1.1.9-20-bookworm

# current node -v (24.10.0) https://github.com/devcontainers/images/blob/main/src/javascript-node/history/4.0.3.md#variant-24-bookworm
ARG VARIANT=4.0.3-24-bookworm
FROM mcr.microsoft.com/vscode/devcontainers/javascript-node:${VARIANT}

RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
    direnv \
    sqlite3

RUN chsh -s /bin/zsh root \
  && chsh -s /bin/zsh node    

RUN npm install -g @anthropic-ai/claude-code



