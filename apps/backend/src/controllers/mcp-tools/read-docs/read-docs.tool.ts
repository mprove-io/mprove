import { Injectable, UseFilters } from '@nestjs/common';
import type { Context } from '@rekog/mcp-nest';
import { Tool } from '@rekog/mcp-nest';
import type { Request } from 'express';
import { McpExceptionFilter } from '#backend/filters/mcp-exception.filter';
import { DocsService } from '#backend/services/docs.service';
import {
  MCP_TOOL_READ_DOCS,
  MCP_TOOL_READ_DOCS_DESCRIPTION
} from '#common/constants/mcp-tools-registry';
import { zodDeepNullish } from '#common/functions/zod-deep-nullish';
import { zodStripMcpSchemaId } from '#common/functions/zod-strip-mcp-schema-id';
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
    description: MCP_TOOL_READ_DOCS_DESCRIPTION,
    parameters: zodStripMcpSchemaId({ schema: zMcpToolReadDocsInput }),
    outputSchema: zodStripMcpSchemaId({
      schema: zodDeepNullish({ schema: zMcpToolReadDocsOutput })
    })
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
