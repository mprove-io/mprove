VERSION=$(jq -r '.version' package.json) && \
git tag -a prep-$VERSION -m "prepare $VERSION"