VERSION=$(jq -r '.version' package.json) && \
git tag -a cli-$VERSION -m "prepare $VERSION"