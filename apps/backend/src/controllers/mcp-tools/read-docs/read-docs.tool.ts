import { Injectable, UseFilters } from '@nestjs/common';
import type { Context } from '@rekog/mcp-nest';
import { Tool } from '@rekog/mcp-nest';
import type { Request } from 'express';
import { McpExceptionFilter } from '#backend/filters/mcp-exception.filter';
import { DocsService } from '#backend/services/docs.service';
import { MCP_TOOL_READ_DOCS } from '#common/constants/top-backend';
import { zodDeepNullish } from '#common/functions/zod-deep-nullish';
import {
  type McpToolReadDocsInput,
  zMcpToolReadDocsInput,
  zMcpToolReadDocsOutput
} from '#common/zod/to-backend/mcp-tools/mcp-tool-read-docs';

@Injectable()
@UseFilters(McpExceptionFilter)
export class ReadDocsTool {
  constructor(private docsService: DocsService) {}

  @Tool({
    name: MCP_TOOL_READ_DOCS,
    description: `Read Mprove documentation pages sourced from https://docs.mprove.io/content/docs/docs-for-ai.mdx.
Call with pageIds to read one or more pages in one tool call.`,
    parameters: zMcpToolReadDocsInput,
    outputSchema: zodDeepNullish({ schema: zMcpToolReadDocsOutput })
  })
  async readDocs(
    item: McpToolReadDocsInput,
    context: Context,
    request: Request
  ) {
    return this.docsService.readDocs({
      pageIds: item.pageIds
    });
  }
}
