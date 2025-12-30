VERSION=$(jq -r '.version' package.json) && \
git tag -a e-$VERSION -m "prepare $VERSION"