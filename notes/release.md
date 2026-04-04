# tests and e2e

pnpm inst

pnpm test:disk
pnpm test:blockml

pnpm start

pnpm e2e:backend
pnpm e2e:mcli

# cli pre-release

(manual) edit MPROVE_RELEASE_TAG in .env - set "-dev"

pnpm version-write

pnpm inst

scripts/tag/tag-cli.sh
git push origin --tags

(wait for cli action to finish in mprove)
(manually publish mprove-cli pre-release - from draft. download cli to check - if needed)
(wait for action to finish in mprove-cli for brew)

devcontainer:
scripts/dev/install-mprove-cli.sh 11.0.109-dev

mac:
tar -xzf <mprove-cli-downloaded-path>
xattr -d com.apple.quarantine mprove
./mprove version

(update template and mprove versions in skills/e2b-template-config.json)

pnpm e2b:build

update template in env

# manual tests

cloudflared
pnpm start
check sessions

# release

(manual) edit MPROVE_RELEASE_TAG in .env

// write version to multiple package.json
pnpm version-write

git add .
git commit -m <commit-message>

(push button)

# app and cli - tags

scripts/tag/tag-app.sh
scripts/tag/tag-cli.sh
git push origin --tags

(wait for app action to finish in mprove)
(wait for cli action to finish in mprove)

# cli - release

(manually publish mprove-cli release - from draft)
(wait for action to finish in mprove-cli for brew)

# update e2b template

update e2b config
build e2b template
set template public in e2b ui
add templateId to create-env and .env

# update pods

update app version
update templateId

# app - release

(manually create Mprove release - from tag)

# helm - release

(helm-docs -s file -c mproves)
(scripts/helm-package-mprove.sh)
(scripts/helm-push-mprove.sh)
