VERSION=$(jq -r '.version' package.json) && \
git tag -a app-$VERSION -m "prepare $VERSION"