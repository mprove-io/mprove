import type { PrepTest } from '#backend/interfaces/prep-test';
import { DocsService } from '#backend/services/docs.service';
import type { McpToolSearchDocsOutput } from '#common/types/backend/mcp-tools/mcp-tool-search-docs';

export function mockMcpSearchDocsOutput(item: { prepTest: PrepTest }): void {
  let { prepTest } = item;

  let docsService: DocsService =
    prepTest.moduleRef.get<DocsService>(DocsService);

  // Deliberately violate the service's contract to exercise MCP output validation.
  docsService.searchDocs = (): McpToolSearchDocsOutput =>
    ({
      ok: true,
      searchDocsResults: 'not-an-array',
      extra: 'preserve-me'
    }) as unknown as McpToolSearchDocsOutput;
}
