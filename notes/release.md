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

(update pods)

(manually create Mprove release - from tag)
(publish helm release)

(download cli to check - if needed)
tar -xzf <mprove-cli-downloaded-path>
xattr -d com.apple.quarantine mprove
./mprove version

(manually publish mprove-cli release - from draft)
(wait for action finish in mprove-cli)
