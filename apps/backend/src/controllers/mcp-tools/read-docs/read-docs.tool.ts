import { UseFilters } from '@nestjs/common';
import { McpController, Tool } from '@rekog/mcp-nest';
import { McpExceptionFilter } from '#backend/filters/mcp-exception/mcp-exception.filter';
import { makeMcpOutputSchema } from '#backend/functions/make-mcp-output-schema/make-mcp-output-schema';
import { zodStripMcpSchemaId } from '#backend/functions/zod/zod-strip-mcp-schema-id/zod-strip-mcp-schema-id';
import { DocsService } from '#backend/services/docs/docs.service';
import {
  MCP_TOOL_READ_DOCS,
  MCP_TOOL_READ_DOCS_DESCRIPTION
} from '#common/constants/mcp-tools-registry';
import {
  type McpToolReadDocsInput,
  zMcpToolReadDocsInput
} from '#common/types/backend/mcp-tools/mcp-tool-read-docs/mcp-tool-read-docs-input';
import { zMcpToolReadDocsOutput } from '#common/types/backend/mcp-tools/mcp-tool-read-docs/mcp-tool-read-docs-output';

@McpController()
@UseFilters(McpExceptionFilter)
export class ReadDocsTool {
  constructor(private docsService: DocsService) {}

  @Tool({
    name: MCP_TOOL_READ_DOCS,
    description: MCP_TOOL_READ_DOCS_DESCRIPTION,
    parameters: zodStripMcpSchemaId({ schema: zMcpToolReadDocsInput }),
    outputSchema: makeMcpOutputSchema({
      schema: zMcpToolReadDocsOutput
    })
  })
  async readDocs(item: McpToolReadDocsInput) {
    return this.docsService.readDocs({
      pageIds: item.pageIds
    });
  }
}
