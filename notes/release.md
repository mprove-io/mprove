# release

(manual) edit MPROVE_RELEASE_TAG in .env

// write version to multiple package.json
pnpm version-write

git add .
git commit -m <commit-message>

(push button)

scripts/tag/tag-app.sh
scripts/tag/tag-cli.sh
git push origin --tags

(wait for action finish in mprove)
(manually download cli to check)

tar -xzf <mprove-cli-downloaded-path>
xattr -d com.apple.quarantine mprove
mprove version

(manually publish release from draft in mprove-cli)
(wait for action finish in mprove-cli)
