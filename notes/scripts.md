# mprove cli

(manual) edit tag in .env
(manual) edit tag in package.json
pnpm install
git add .
git commit -m ...
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

# left terminal

c -f docker-compose.yml -f docker-compose.lab.yml build backend && \
c -f docker-compose.yml -f docker-compose.lab.yml build blockml && \
c -f docker-compose.yml -f docker-compose.lab.yml build disk && \
c -f docker-compose.yml -f docker-compose.lab.yml build front && \
c -f docker-compose.yml -f docker-compose.lab.yml build mcli

c -f docker-compose.yml -f docker-compose.lab.yml push backend && \
c -f docker-compose.yml -f docker-compose.lab.yml push blockml && \
c -f docker-compose.yml -f docker-compose.lab.yml push disk && \
c -f docker-compose.yml -f docker-compose.lab.yml push front && \
c -f docker-compose.yml -f docker-compose.lab.yml push mcli

c -f docker-compose.yml -f docker-compose.lab.yml build dwh-postgres && \
c -f docker-compose.yml -f docker-compose.lab.yml build dwh-mysql

c -f docker-compose.yml -f docker-compose.lab.yml push dwh-postgres
c -f docker-compose.yml -f docker-compose.lab.yml push dwh-mysql
