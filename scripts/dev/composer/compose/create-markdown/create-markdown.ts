import { resolve } from 'node:path';
import { Result } from '@praha/byethrow';
import { readTextFile } from '../../shared/read-text-file/read-text-file';
import type { CreateMarkdownError } from '../../types/function-errors/create-markdown-error';
import type { ReadTextFileError } from '../../types/function-errors/read-text-file-error';
import type { Manifest } from '../../types/manifest';
import { adjustMarkdownHeadings } from './adjust-markdown-headings/adjust-markdown-headings';
import { validateMarkdownTitles } from './validate-markdown-titles/validate-markdown-titles';

export function createMarkdown(item: {
  contentDirectory: string;
  manifest: Manifest;
}): Result.Result<string, CreateMarkdownError> {
  return Result.pipe(
    Result.succeed(item),
    Result.bind(
      'contents',
      (v): Result.Result<string[], ReadTextFileError> =>
        Result.sequence(v.manifest.relativePaths, relativePath => {
          let filePath: string = resolve(v.contentDirectory, relativePath);

          let contentResult: Result.Result<string, ReadTextFileError> =
            readTextFile({ filePath: filePath });

          return contentResult;
        })
    ),
    Result.andThrough(v =>
      validateMarkdownTitles({
        contentDirectory: v.contentDirectory,
        contents: v.contents,
        relativePaths: v.manifest.relativePaths
      })
    ),
    Result.bind(
      'adjustedContents',
      (v): Result.Result<string[], never> =>
        Result.sequence(
          v.contents.map((content, index) => {
            let relativePath: string = v.manifest.relativePaths[index];

            let nestingLevel: number = relativePath.split('/').length - 1;

            let adjustedContentResult: Result.Result<string, never> =
              adjustMarkdownHeadings({
                content: content,
                nestingLevel: nestingLevel
              });

            return adjustedContentResult;
          })
        )
    ),
    Result.map((v): string => {
      let sections: string[] = v.adjustedContents.map(adjustedContent => {
        let section: string = adjustedContent.replace(/\s+$/u, '');

        return section;
      });

      let markdown: string = sections.join('\n\n');

      return markdown;
    })
  );
}
