#!/bin/bash

set -euo pipefail

VERSION="${1:?Usage: $0 <version>}"
URL="https://github.com/mprove-io/mprove-cli/releases/download/${VERSION}/mprove-cli-${VERSION}-linux-amd64.tar.gz"
TARBALL="mprove-cli-${VERSION}-linux-amd64.tar.gz"

echo "Downloading mprove-cli ${VERSION}..."
curl -L -o "${TARBALL}" "${URL}"

echo "Extracting..."
tar -xzf "${TARBALL}"

echo "Installing to /usr/local/bin/..."
sudo mv mprove /usr/local/bin/

echo "Cleaning up..."
rm -f "${TARBALL}"

echo "Done. Version:"
mprove version
