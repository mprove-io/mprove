import { UseFilters } from '@nestjs/common';
import { McpController, Tool } from '@rekog/mcp-nest';
import { McpExceptionFilter } from '#backend/filters/mcp-exception/mcp-exception.filter';
import { makeMcpOutputSchema } from '#backend/functions/make-mcp-output-schema/make-mcp-output-schema';
import { zodStripMcpSchemaId } from '#backend/functions/zod/zod-strip-mcp-schema-id/zod-strip-mcp-schema-id';
import { DocsService } from '#backend/services/docs/docs.service';
import {
  MCP_TOOL_LIST_DOCS,
  MCP_TOOL_LIST_DOCS_DESCRIPTION
} from '#common/constants/mcp-tools-registry';
import { zMcpToolListDocsInput } from '#common/types/backend/mcp-tools/mcp-tool-list-docs/mcp-tool-list-docs-input';
import { zMcpToolListDocsOutput } from '#common/types/backend/mcp-tools/mcp-tool-list-docs/mcp-tool-list-docs-output';

@McpController()
@UseFilters(McpExceptionFilter)
export class ListDocsTool {
  constructor(private docsService: DocsService) {}

  @Tool({
    name: MCP_TOOL_LIST_DOCS,
    description: MCP_TOOL_LIST_DOCS_DESCRIPTION,
    parameters: zodStripMcpSchemaId({ schema: zMcpToolListDocsInput }),
    outputSchema: makeMcpOutputSchema({
      schema: zMcpToolListDocsOutput
    })
  })
  async listDocs() {
    return this.docsService.listDocs();
  }
}
