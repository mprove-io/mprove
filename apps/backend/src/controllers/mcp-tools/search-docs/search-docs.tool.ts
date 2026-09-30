import { UseFilters } from '@nestjs/common';
import { McpController, Tool } from '@rekog/mcp-nest';
import { McpExceptionFilter } from '#backend/filters/mcp-exception.filter';
import { zodDeepNullish } from '#backend/functions/zod-deep-nullish';
import { zodStripMcpSchemaId } from '#backend/functions/zod-strip-mcp-schema-id';
import { DocsService } from '#backend/services/docs.service';
import {
  MCP_TOOL_SEARCH_DOCS,
  MCP_TOOL_SEARCH_DOCS_DESCRIPTION
} from '#common/constants/mcp-tools-registry';
import {
  type McpToolSearchDocsInput,
  zMcpToolSearchDocsInput,
  zMcpToolSearchDocsOutput
} from '#common/zod/backend/mcp-tools/mcp-tool-search-docs';

@McpController()
@UseFilters(McpExceptionFilter)
export class SearchDocsTool {
  constructor(private docsService: DocsService) {}

  @Tool({
    name: MCP_TOOL_SEARCH_DOCS,
    description: MCP_TOOL_SEARCH_DOCS_DESCRIPTION,
    parameters: zodStripMcpSchemaId({ schema: zMcpToolSearchDocsInput }),
    outputSchema: zodStripMcpSchemaId({
      schema: zodDeepNullish({ schema: zMcpToolSearchDocsOutput })
    })
  })
  async searchDocs(item: McpToolSearchDocsInput) {
    return this.docsService.searchDocs({
      query: item.query
    });
  }
}
