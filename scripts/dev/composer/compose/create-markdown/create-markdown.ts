import { resolve } from 'node:path';
import { Result } from '@praha/byethrow';
import { readTextFile } from '../../shared/read-text-file/read-text-file';
import type { CreateMarkdownError } from '../../types/function-errors/create-markdown-error';
import type { ReadTextFileError } from '../../types/function-errors/read-text-file-error';
import type { Manifest } from '../../types/manifest';
import { adjustMarkdownHeadings } from './adjust-markdown-headings/adjust-markdown-headings';

export function createMarkdown(item: {
  manifest: Manifest;
  sourceDirectory: string;
}): Result.Result<string, CreateMarkdownError> {
  return Result.pipe(
    Result.succeed(item),
    Result.bind(
      'contents',
      (v): Result.Result<string[], ReadTextFileError> =>
        Result.sequence(v.manifest.relativePaths, relativePath => {
          let filePath: string = resolve(v.sourceDirectory, relativePath);

          let contentResult: Result.Result<string, ReadTextFileError> =
            readTextFile({ filePath: filePath });

          return contentResult;
        })
    ),
    Result.map((v): string => {
      let sections: string[] = v.contents.map((content, index) => {
        let relativePath: string = v.manifest.relativePaths[index];

        let nestingLevel: number = relativePath.split('/').length - 1;

        let adjustedContent: string = adjustMarkdownHeadings({
          content: content,
          nestingLevel: nestingLevel
        });

        let section: string = adjustedContent.replace(/\s+$/u, '');

        return section;
      });

      let markdown: string = sections.join('\n\n');

      return markdown;
    })
  );
}
