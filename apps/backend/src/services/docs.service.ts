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
    return { ok: true, filePaths: [...toc] };
  }

  readDocs(item: { filePaths: string[] }): McpToolReadDocsOutput {
    let { filePaths } = item;

    let wantedPaths: string[] = [];

    filePaths.forEach(path => {
      let wantedPath = path.trim();
      if (wantedPath) {
        wantedPaths.push(wantedPath);
      }
    });

    let hasWantedPaths = wantedPaths.length > 0;
    if (!hasWantedPaths) {
      return {
        ok: false,
        error:
          'Provide filePaths to read documentation content. Call list-docs to list available files.'
      };
    }

    let docs: { filePath: string; content: string }[] = [];
    let missingPaths: string[] = [];

    wantedPaths.forEach(wantedPath => {
      let normalized = wantedPath.replace(/\\/g, '/').replace(/^\/+/, '');

      let entry = tocToContent.find(item => item.filePath === normalized);

      if (entry === undefined) {
        missingPaths.push(wantedPath);
        return;
      }

      docs.push({
        filePath: normalized,
        content: entry.content
      });
    });

    let hasMissingPaths = missingPaths.length > 0;
    if (hasMissingPaths) {
      let missingList = missingPaths.map(path => `"${path}"`).join(', ');
      return {
        ok: false,
        error: `File(s) ${missingList} not found. Call list-docs to list available files.`
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

    let searchDocsResults: { filePath: string; snippets: string[] }[] = [];

    tocToContent.forEach(entry => {
      let filePath = entry.filePath;
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
        filePath: filePath,
        snippets: snippets
      });
    });

    return {
      ok: true,
      searchDocsResults: searchDocsResults
    };
  }
}
