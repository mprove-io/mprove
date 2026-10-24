import { Injectable } from '@nestjs/common';
import { toc } from '#backend/mprove-docs-cache/toc';
import type { McpToolListDocsOutput } from '#common/types/backend/mcp-tools/mcp-tool-list-docs/mcp-tool-list-docs-output';

@Injectable()
export class ListDocsService {
  listDocs(): McpToolListDocsOutput {
    let output: McpToolListDocsOutput = { ok: true, pageIds: [...toc] };

    return output;
  }
}
