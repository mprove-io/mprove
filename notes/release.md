# release

(manual) edit MPROVE_RELEASE_TAG in .env

// write version to multiple package.json
pnpm version-write

git add .
git commit -m <commit-message>

(push button)

scripts/tag/tag-app.sh
scripts/tag/tag-cli.sh
git push lab --tags

(wait for action finish in mprove)
(manually publish release from draft in mprove-cli)
(wait for action finish in mprove-cli)

(manually download cli to check)

tar -xzf mprove-cli
xattr -d com.apple.quarantine mprove
