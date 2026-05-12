import { Injectable, UseFilters } from '@nestjs/common';
import type { Context } from '@rekog/mcp-nest';
import { Tool } from '@rekog/mcp-nest';
import type { Request } from 'express';
import { McpExceptionFilter } from '#backend/filters/mcp-exception.filter';
import { DocsService } from '#backend/services/docs.service';
import { MCP_TOOL_LIST_DOCS_DESCRIPTION } from '#backend/services/mcp-tools-registry';
import { MCP_TOOL_LIST_DOCS } from '#common/constants/top-backend';
import { zodDeepNullish } from '#common/functions/zod-deep-nullish';
import {
  type McpToolListDocsInput,
  zMcpToolListDocsInput,
  zMcpToolListDocsOutput
} from '#common/zod/to-backend/mcp-tools/mcp-tool-list-docs';

@Injectable()
@UseFilters(McpExceptionFilter)
export class ListDocsTool {
  constructor(private docsService: DocsService) {}

  @Tool({
    name: MCP_TOOL_LIST_DOCS,
    description: MCP_TOOL_LIST_DOCS_DESCRIPTION,
    parameters: zMcpToolListDocsInput,
    outputSchema: zodDeepNullish({ schema: zMcpToolListDocsOutput })
  })
  async listDocs(
    item: McpToolListDocsInput,
    context: Context,
    request: Request
  ) {
    return this.docsService.listDocs();
  }
}
