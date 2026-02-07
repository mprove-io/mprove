VERSION="${1:?Usage: check-sandbox-agent.sh <version> (e.g. 0.1.8)}"

INSTALL_URL="https://releases.rivet.dev/sandbox-agent/${VERSION}/install.sh"
BINARY_URL="https://releases.rivet.dev/sandbox-agent/${VERSION}/binaries/sandbox-agent-x86_64-unknown-linux-musl"

INSTALL_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$INSTALL_URL")
BINARY_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BINARY_URL")

if [ "$INSTALL_STATUS" = "200" ]; then
  echo "EXISTS: $INSTALL_URL"
else
  echo "NOT FOUND ($INSTALL_STATUS): $INSTALL_URL"
fi

if [ "$BINARY_STATUS" = "200" ]; then
  echo "EXISTS: $BINARY_URL"
else
  echo "NOT FOUND ($BINARY_STATUS): $BINARY_URL"
fi
