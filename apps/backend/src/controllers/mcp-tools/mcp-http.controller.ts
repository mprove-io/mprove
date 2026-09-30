import { Controller } from '@nestjs/common';
import { StreamableHttpController } from '@rekog/mcp-nest';

// A real HTTP controller keeps the global JwtAuthGuard and AppFilter in front
// of every MCP request, including initialize and tools/list.
@Controller('api/mcp')
export class McpHttpController extends StreamableHttpController {}
