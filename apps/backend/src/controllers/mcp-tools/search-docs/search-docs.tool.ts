import { Injectable, UseFilters } from '@nestjs/common';
import type { Context } from '@rekog/mcp-nest';
import { Tool } from '@rekog/mcp-nest';
import type { Request } from 'express';
import { McpExceptionFilter } from '#backend/filters/mcp-exception.filter';
import { DocsService } from '#backend/services/docs.service';
import { MCP_TOOL_SEARCH_DOCS_DESCRIPTION } from '#backend/services/mcp-tools-registry';
import { MCP_TOOL_SEARCH_DOCS } from '#common/constants/top-backend';
import { zodDeepNullish } from '#common/functions/zod-deep-nullish';
import {
  type McpToolSearchDocsInput,
  zMcpToolSearchDocsInput,
  zMcpToolSearchDocsOutput
} from '#common/zod/to-backend/mcp-tools/mcp-tool-search-docs';

@Injectable()
@UseFilters(McpExceptionFilter)
export class SearchDocsTool {
  constructor(private docsService: DocsService) {}

  @Tool({
    name: MCP_TOOL_SEARCH_DOCS,
    description: MCP_TOOL_SEARCH_DOCS_DESCRIPTION,
    parameters: zMcpToolSearchDocsInput,
    outputSchema: zodDeepNullish({ schema: zMcpToolSearchDocsOutput })
  })
  async searchDocs(
    item: McpToolSearchDocsInput,
    context: Context,
    request: Request
  ) {
    return this.docsService.searchDocs({
      query: item.query
    });
  }
}
