import { Injectable } from '@nestjs/common';
import { toc } from '../../../mprove-docs-cache/toc';
import { tocToContent } from '../../../mprove-docs-cache/toc-to-content';

type ReadDocResult =
  | { ok: true; mode: 'index'; files: readonly string[] }
  | { ok: true; mode: 'file'; filePath: string; content: string }
  | { ok: false; error: string };

@Injectable()
export class ExplorerDocsService {
  readDoc(item: { filePath?: string | null }): ReadDocResult {
    let { filePath } = item;

    let wantedPath = filePath?.trim();

    if (!wantedPath) {
      return { ok: true, mode: 'index', files: toc };
    }

    let normalized = wantedPath.replace(/\\/g, '/').replace(/^\/+/, '');

    let content = tocToContent[normalized];

    if (content === undefined) {
      return {
        ok: false,
        error: `File "${wantedPath}" not found. Call read_docs with no arguments to list available files.`
      };
    }

    return {
      ok: true,
      mode: 'file',
      filePath: normalized,
      content: content
    };
  }
}
