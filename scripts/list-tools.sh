curl -s -X POST "${MPROVE_CLI_HOST}/api/mcp" \
  -H "Authorization: Bearer ${MPROVE_CLI_API_KEY}" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/list",
    "params": {},
    "id": 2
  }' | jq