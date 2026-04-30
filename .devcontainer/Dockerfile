# https://github.com/devcontainers/images/blob/main/src/javascript-node/history/4.0.9.md#variant-24-bookworm
# current node -v (24.14.0) 

ARG VARIANT=4.0.9-24-bookworm
FROM mcr.microsoft.com/vscode/devcontainers/javascript-node:${VARIANT}

RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
    direnv \
    sqlite3 \
    uuid-runtime

RUN chsh -s /bin/zsh root \
  && chsh -s /bin/zsh node    

RUN curl -fsSL https://bun.sh/install | bash \
    && ln -s /root/.bun/bin/bun /usr/local/bin/bun \
    && ln -s /root/.bun/bin/bunx /usr/local/bin/bunx

RUN npm install -g @e2b/cli

RUN curl -fsSL https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o /usr/local/bin/cloudflared \
    && chmod +x /usr/local/bin/cloudflared

RUN npm install -g @malloydata/cli

RUN npm install -g @openai/codex

RUN npm install -g opencode-ai
