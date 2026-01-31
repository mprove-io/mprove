# mprove cli (in progress)

(manual) edit tag in .env

// multiple places
(manual) edit tag in package.json

pnpm install

git add .
git commit -m <commit-message>

(push button)

scripts/tag/tag-app.sh
scripts/tag/tag-cli.sh
git push lab --tags

(wait for action finish in mprove or mprove-lab)
(manually publish release from draft in mprove-cli)
(wait for action finish in mprove-cli)

# manual

tar -xzf mprove-cl
xattr -d com.apple.quarantine mprove

# deps

pnpm install

cd /mprove/apps/mcli && pnpm install

# devcontainer

cd /mprove && pnpm install && \
cd /mprove/apps/mcli && pnpm install && \
cd /mprove && pnpm build:mcli

cd /mprove/dist/apps/mcli && pnpm install --frozen-lockfile && \
pnpm pkg:mcli --no-bytecode --public-packages "\*" --public --targets node24-linux-x64 && \
cd /mprove && dist/apps/mcli/bin/mprove version

# docker compose (outside of devcontainer)

c build backend && \
c build blockml && \
c build disk && \
c build front && \
c build mcli

c build dwh-postgres && \
c build dwh-mysql

c push dwh-postgres && \
c push dwh-mysql
