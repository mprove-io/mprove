import { Injectable } from '@nestjs/common';
import { tocToContent } from '#backend/mprove-docs-cache/toc-to-content';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { McpToolReadDocsOutput } from '#common/types/backend/mcp-tools/mcp-tool-read-docs/mcp-tool-read-docs-output';

type DocContent = {
  pageId: string;
  content: string;
};

@Injectable()
export class ReadDocsService {
  readDocs(item: { pageIds: string[] }): McpToolReadDocsOutput {
    let { pageIds } = item;

    let wantedPageIds: string[] = [];

    pageIds.forEach(pageId => {
      let wantedPageId: string = pageId.trim();

      if (wantedPageId) {
        wantedPageIds.push(wantedPageId);
      }
    });

    if (wantedPageIds.length === 0) {
      let output: McpToolReadDocsOutput = {
        ok: false,
        error:
          'Provide pageIds to read documentation content. Call list-docs to list available pageIds.'
      };

      return output;
    }

    let docs: DocContent[] = [];

    let missingPageIds: string[] = [];

    wantedPageIds.forEach(wantedPageId => {
      let entry: DocContent = tocToContent.find(
        item => item.pageId === wantedPageId
      );

      if (isUndefined(entry)) {
        missingPageIds.push(wantedPageId);

        return;
      }

      docs.push({
        pageId: wantedPageId,
        content: entry.content
      });
    });

    if (missingPageIds.length > 0) {
      let missingList: string = missingPageIds
        .map(pageId => `"${pageId}"`)
        .join(', ');

      let output: McpToolReadDocsOutput = {
        ok: false,
        error: `Page id(s) ${missingList} not found. Call list-docs to list available pageIds.`
      };

      return output;
    }

    let output: McpToolReadDocsOutput = {
      ok: true,
      readDocsResults: docs
    };

    return output;
  }
}
