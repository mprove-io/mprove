import { UseFilters } from '@nestjs/common';
import { McpController, Tool } from '@rekog/mcp-nest';
import { SearchDocsService } from '#backend/controllers/mcp-tools/search-docs/search-docs.service';
import { McpExceptionFilter } from '#backend/filters/mcp-exception/mcp-exception.filter';
import { makeMcpOutputSchema } from '#backend/functions/mcp/make-mcp-output-schema/make-mcp-output-schema';
import { zodStripMcpSchemaId } from '#backend/functions/zod/zod-strip-mcp-schema-id/zod-strip-mcp-schema-id';
import {
  MCP_TOOL_SEARCH_DOCS,
  MCP_TOOL_SEARCH_DOCS_DESCRIPTION
} from '#common/constants/mcp-tools-registry';
import {
  type McpToolSearchDocsInput,
  zMcpToolSearchDocsInput
} from '#common/types/backend/mcp-tools/mcp-tool-search-docs/mcp-tool-search-docs-input';
import {
  type McpToolSearchDocsOutput,
  zMcpToolSearchDocsOutput
} from '#common/types/backend/mcp-tools/mcp-tool-search-docs/mcp-tool-search-docs-output';

@McpController()
@UseFilters(McpExceptionFilter)
export class SearchDocsTool {
  constructor(private searchDocsService: SearchDocsService) {}

  @Tool({
    name: MCP_TOOL_SEARCH_DOCS,
    description: MCP_TOOL_SEARCH_DOCS_DESCRIPTION,
    parameters: zodStripMcpSchemaId({ schema: zMcpToolSearchDocsInput }),
    outputSchema: makeMcpOutputSchema({
      schema: zMcpToolSearchDocsOutput
    })
  })
  async searchDocs(
    item: McpToolSearchDocsInput
  ): Promise<McpToolSearchDocsOutput> {
    let output: McpToolSearchDocsOutput = this.searchDocsService.searchDocs({
      ...item
    });

    return output;
  }
}
