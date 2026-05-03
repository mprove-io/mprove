import { Injectable } from '@nestjs/common';
import { toc } from '#backend/mprove-docs-cache/toc';
import { tocToContent } from '#backend/mprove-docs-cache/toc-to-content';

type ReadDocResult =
  | { ok: true; mode: 'file'; filePath: string; content: string }
  | {
      ok: true;
      mode: 'files';
      files: { filePath: string; content: string }[];
    }
  | { ok: false; error: string };

@Injectable()
export class ExplorerDocsService {
  listDocs(): { ok: true; mode: 'index'; files: readonly string[] } {
    return { ok: true, mode: 'index', files: toc };
  }

  readDocs(item: { filePaths?: string[] | null }): ReadDocResult {
    let { filePaths } = item;

    let wantedPaths: string[] = [];

    filePaths?.forEach(path => {
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
          'Provide filePaths to read documentation content. Call list_docs to list available files.'
      };
    }

    let docs: { filePath: string; content: string }[] = [];
    let missingPaths: string[] = [];

    wantedPaths.forEach(wantedPath => {
      let normalized = wantedPath.replace(/\\/g, '/').replace(/^\/+/, '');

      let content = tocToContent[normalized];

      if (content === undefined) {
        missingPaths.push(wantedPath);
        return;
      }

      docs.push({
        filePath: normalized,
        content: content
      });
    });

    let hasMissingPaths = missingPaths.length > 0;
    if (hasMissingPaths) {
      let missingList = missingPaths.map(path => `"${path}"`).join(', ');
      return {
        ok: false,
        error: `File(s) ${missingList} not found. Call list_docs to list available files.`
      };
    }

    let shouldReturnSingleFile = docs.length === 1;
    if (shouldReturnSingleFile) {
      let doc = docs[0];
      return {
        ok: true,
        mode: 'file',
        filePath: doc.filePath,
        content: doc.content
      };
    }

    return {
      ok: true,
      mode: 'files',
      files: docs
    };
  }
}
