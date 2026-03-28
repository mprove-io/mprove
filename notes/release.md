# release

(manual) edit MPROVE_RELEASE_TAG in .env

// write version to multiple package.json
pnpm version-write

git add .
git commit -m <commit-message>

(push button)

# app - tag

scripts/tag/tag-app.sh
git push origin --tags

(wait for action finish in mprove)

(update pods)

# app - release

(manually create Mprove release - from tag)

# helm - release

(publish helm release)

# cli - tag

scripts/tag/tag-cli.sh
git push origin --tags

# cli - pre-release

(manually publish mprove-cli pre-release - from draft. download cli to check - if needed)
devcontainer:
scripts/dev/install-mprove-cli.sh 11.0.104-dev

mac:
tar -xzf <mprove-cli-downloaded-path>
xattr -d com.apple.quarantine mprove
./mprove version

# cli - release

(manually publish mprove-cli release - from draft)
(wait for action finish in mprove-cli for brew)
