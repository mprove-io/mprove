VERSION=$(jq -r '.version' package.json) && \
git tag -a r-$VERSION -m "prepare $VERSION"