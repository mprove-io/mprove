VERSION=$(jq -r '.version' package.json) && \
git tag -a d-$VERSION -m "prepare $VERSION"