import { resolve } from 'node:path';
import { Result } from '@praha/byethrow';
import { readTextFile } from '../shared/read-text-file/read-text-file';
import type { ComposerError } from '../types/errors/composer-error';
import type { Manifest } from '../types/manifest';
import { adjustMarkdownHeadings } from './02-adjust-markdown-headings/adjust-markdown-headings';

export function createMarkdown(item: {
  manifest: Manifest;
  sourceDirectory: string;
}): Result.Result<string, ComposerError> {
  let { manifest, sourceDirectory } = item;

  let sections: string[] = [];

  let sectionsResult: Result.Result<string[], ComposerError> =
    Result.succeed(sections);

  for (let i = 0; i < manifest.relativePaths.length; i++) {
    let relativePath: string = manifest.relativePaths[i];

    let filePath: string = resolve(sourceDirectory, relativePath);

    let nestingLevel: number = relativePath.split('/').length - 1;

    sectionsResult = Result.andThen((v: string[]) => {
      let currentSections: string[] = v;

      return Result.map((v: string) => {
        let content: string = v;

        let adjustedContent: string = adjustMarkdownHeadings({
          content: content,
          nestingLevel: nestingLevel
        });

        let section: string = adjustedContent.replace(/\s+$/u, '');

        currentSections.push(section);

        return currentSections;
      })(readTextFile({ filePath: filePath }));
    })(sectionsResult);
  }

  return Result.map((v: string[]) => v.join('\n\n'))(sectionsResult);
}
