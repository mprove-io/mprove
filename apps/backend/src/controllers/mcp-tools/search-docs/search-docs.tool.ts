import { UseFilters } from '@nestjs/common';
import { McpController, Tool } from '@rekog/mcp-nest';
import { McpExceptionFilter } from '#backend/filters/mcp-exception.filter';
import { makeMcpOutputSchema } from '#backend/functions/make-mcp-output-schema';
import { zodStripMcpSchemaId } from '#backend/functions/zod-strip-mcp-schema-id';
import { DocsService } from '#backend/services/docs.service';
import {
  MCP_TOOL_SEARCH_DOCS,
  MCP_TOOL_SEARCH_DOCS_DESCRIPTION
} from '#common/constants/mcp-tools-registry';
import {
  type McpToolSearchDocsInput,
  zMcpToolSearchDocsInput
} from '#common/types/backend/mcp-tools/mcp-tool-search-docs/mcp-tool-search-docs-input';
import { zMcpToolSearchDocsOutput } from '#common/types/backend/mcp-tools/mcp-tool-search-docs/mcp-tool-search-docs-output';

@McpController()
@UseFilters(McpExceptionFilter)
export class SearchDocsTool {
  constructor(private docsService: DocsService) {}

  @Tool({
    name: MCP_TOOL_SEARCH_DOCS,
    description: MCP_TOOL_SEARCH_DOCS_DESCRIPTION,
    parameters: zodStripMcpSchemaId({ schema: zMcpToolSearchDocsInput }),
    outputSchema: makeMcpOutputSchema({
      schema: zMcpToolSearchDocsOutput
    })
  })
  async searchDocs(item: McpToolSearchDocsInput) {
    return this.docsService.searchDocs({
      query: item.query
    });
  }
}
