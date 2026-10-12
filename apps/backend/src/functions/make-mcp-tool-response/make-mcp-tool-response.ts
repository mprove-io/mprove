import { Result } from '@praha/byethrow';
import { McpToolResponseException } from '#backend/filters/mcp-exception/mcp-tool-response-exception';
import type { Er } from '#common/types/shared/errors/er';

// MCP's framework expects payloads or exceptions, not internal Results.
// Keep its existing error text and let McpExceptionFilter route the signal.
export function makeMcpToolResponse<T, E extends { code: Er }>(item: {
  result: Result.Result<T, E>;
}): T {
  let { result } = item;

  if (Result.isFailure(result)) {
    throw new McpToolResponseException({
      message: JSON.stringify({ error: result.error.code })
    });
  }

  let output: T = result.value;

  return output;
}
