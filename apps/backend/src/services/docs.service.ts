import { Injectable } from '@nestjs/common';
import { toc } from '#backend/mprove-docs-cache/toc';
import { tocToContent } from '#backend/mprove-docs-cache/toc-to-content';
import type { McpToolListDocsOutput } from '#common/zod/to-backend/mcp-tools/mcp-tool-list-docs';
import type { McpToolReadDocsOutput } from '#common/zod/to-backend/mcp-tools/mcp-tool-read-docs';
import type { McpToolSearchDocsOutput } from '#common/zod/to-backend/mcp-tools/mcp-tool-search-docs';

const SNIPPET_RADIUS = 100;
const MAX_SNIPPETS_PER_FILE = 5;
const MAX_FILES = 50;

@Injectable()
export class DocsService {
  listDocs(): McpToolListDocsOutput {
    return { ok: true, pageIds: [...toc] };
  }

  readDocs(item: { pageIds: string[] }): McpToolReadDocsOutput {
    let { pageIds } = item;

    let wantedPageIds: string[] = [];

    pageIds.forEach(pageId => {
      let wantedPageId = pageId.trim();
      if (wantedPageId) {
        wantedPageIds.push(wantedPageId);
      }
    });

    let hasWantedPageIds = wantedPageIds.length > 0;
    if (!hasWantedPageIds) {
      return {
        ok: false,
        error:
          'Provide pageIds to read documentation content. Call list-docs to list available pageIds.'
      };
    }

    let docs: { pageId: string; content: string }[] = [];
    let missingPageIds: string[] = [];

    wantedPageIds.forEach(wantedPageId => {
      let entry = tocToContent.find(item => item.pageId === wantedPageId);

      if (entry === undefined) {
        missingPageIds.push(wantedPageId);
        return;
      }

      docs.push({
        pageId: wantedPageId,
        content: entry.content
      });
    });

    let hasMissingPageIds = missingPageIds.length > 0;
    if (hasMissingPageIds) {
      let missingList = missingPageIds.map(pageId => `"${pageId}"`).join(', ');
      return {
        ok: false,
        error: `Page id(s) ${missingList} not found. Call list-docs to list available pageIds.`
      };
    }

    return {
      ok: true,
      readDocsResults: docs
    };
  }

  searchDocs(item: { query?: string | null }): McpToolSearchDocsOutput {
    let { query } = item;

    let trimmed = (query ?? '').trim();
    if (!trimmed) {
      return {
        ok: false,
        error: 'Provide a non-empty query to search documentation.'
      };
    }

    let terms: string[] = [];
    trimmed.split(/\s+/).forEach(term => {
      let lower = term.toLowerCase();
      if (lower) {
        terms.push(lower);
      }
    });

    let hasTerms = terms.length > 0;
    if (!hasTerms) {
      return {
        ok: false,
        error: 'Provide a non-empty query to search documentation.'
      };
    }

    let searchDocsResults: { pageId: string; snippets: string[] }[] = [];

    tocToContent.forEach(entry => {
      let pageId = entry.pageId;
      let content = entry.content;

      if (searchDocsResults.length >= MAX_FILES) {
        return;
      }

      let lowerContent = content.toLowerCase();

      let allTermsMatch = terms.every(term => lowerContent.includes(term));
      if (!allTermsMatch) {
        return;
      }

      let snippets: string[] = [];
      terms.forEach(term => {
        if (snippets.length >= MAX_SNIPPETS_PER_FILE) {
          return;
        }

        let idx = lowerContent.indexOf(term);
        if (idx < 0) {
          return;
        }

        let start = Math.max(0, idx - SNIPPET_RADIUS);
        let end = Math.min(content.length, idx + term.length + SNIPPET_RADIUS);
        let raw = content.slice(start, end);
        let collapsed = raw.replace(/\s+/g, ' ').trim();

        snippets.push(collapsed);
      });

      searchDocsResults.push({
        pageId: pageId,
        snippets: snippets
      });
    });

    return {
      ok: true,
      searchDocsResults: searchDocsResults
    };
  }
}
