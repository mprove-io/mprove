import { Injectable } from '@nestjs/common';
import { tocToContent } from '#backend/mprove-docs-cache/toc-to-content';
import type { McpToolSearchDocsOutput } from '#common/types/backend/mcp-tools/mcp-tool-search-docs/mcp-tool-search-docs-output';

const MAX_FILES = 50;

const MAX_SNIPPETS_PER_FILE = 5;

const SNIPPET_RADIUS = 100;

@Injectable()
export class SearchDocsService {
  searchDocs(item: { query?: string }): McpToolSearchDocsOutput {
    let { query } = item;

    let trimmed: string = (query ?? '').trim();

    if (!trimmed) {
      let output: McpToolSearchDocsOutput = {
        ok: false,
        error: 'Provide a non-empty query to search documentation.'
      };

      return output;
    }

    let terms: string[] = [];

    trimmed.split(/\s+/).forEach(term => {
      let lower: string = term.toLowerCase();

      if (lower) {
        terms.push(lower);
      }
    });

    if (terms.length === 0) {
      let output: McpToolSearchDocsOutput = {
        ok: false,
        error: 'Provide a non-empty query to search documentation.'
      };

      return output;
    }

    let searchDocsResults: {
      pageId: string;
      snippets: string[];
    }[] = [];

    tocToContent.forEach(entry => {
      let pageId = entry.pageId;

      let content = entry.content;

      if (searchDocsResults.length >= MAX_FILES) {
        return;
      }

      let lowerContent: string = content.toLowerCase();

      if (!terms.every(term => lowerContent.includes(term))) {
        return;
      }

      let snippets: string[] = [];

      terms.forEach(term => {
        if (snippets.length >= MAX_SNIPPETS_PER_FILE) {
          return;
        }

        let idx: number = lowerContent.indexOf(term);

        if (idx < 0) {
          return;
        }

        let start: number = Math.max(0, idx - SNIPPET_RADIUS);

        let end: number = Math.min(
          content.length,
          idx + term.length + SNIPPET_RADIUS
        );

        let raw: string = content.slice(start, end);

        let collapsed: string = raw.replace(/\s+/g, ' ').trim();

        snippets.push(collapsed);
      });

      searchDocsResults.push({
        pageId: pageId,
        snippets: snippets
      });
    });

    let output: McpToolSearchDocsOutput = {
      ok: true,
      searchDocsResults: searchDocsResults
    };

    return output;
  }
}
