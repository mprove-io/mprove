import { UseFilters } from '@nestjs/common';
import { McpController, Tool } from '@rekog/mcp-nest';
import { ListDocsService } from '#backend/controllers/mcp-tools/list-docs/list-docs.service';
import { McpExceptionFilter } from '#backend/filters/mcp-exception/mcp-exception.filter';
import { makeMcpOutputSchema } from '#backend/functions/mcp/make-mcp-output-schema/make-mcp-output-schema';
import { zodStripMcpSchemaId } from '#backend/functions/zod/zod-strip-mcp-schema-id/zod-strip-mcp-schema-id';
import {
  MCP_TOOL_LIST_DOCS,
  MCP_TOOL_LIST_DOCS_DESCRIPTION
} from '#common/constants/mcp-tools-registry';
import { zMcpToolListDocsInput } from '#common/types/backend/mcp-tools/mcp-tool-list-docs/mcp-tool-list-docs-input';
import {
  type McpToolListDocsOutput,
  zMcpToolListDocsOutput
} from '#common/types/backend/mcp-tools/mcp-tool-list-docs/mcp-tool-list-docs-output';

@McpController()
@UseFilters(McpExceptionFilter)
export class ListDocsTool {
  constructor(private listDocsService: ListDocsService) {}

  @Tool({
    name: MCP_TOOL_LIST_DOCS,
    description: MCP_TOOL_LIST_DOCS_DESCRIPTION,
    parameters: zodStripMcpSchemaId({ schema: zMcpToolListDocsInput }),
    outputSchema: makeMcpOutputSchema({
      schema: zMcpToolListDocsOutput
    })
  })
  async listDocs(): Promise<McpToolListDocsOutput> {
    let output: McpToolListDocsOutput = this.listDocsService.listDocs();

    return output;
  }
}
