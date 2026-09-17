import { Result } from '@praha/byethrow';
import { readTextFile } from '../../shared/read-text-file/read-text-file';
import type { CreateMarkdownSectionError } from '../../types/function-errors/create-markdown-section-error';
import type { ReadTextFileError } from '../../types/function-errors/read-text-file-error';
import { adjustMarkdownHeadings } from './02-adjust-markdown-headings/adjust-markdown-headings';

export function createMarkdownSection(item: {
  filePath: string;
  nestingLevel: number;
}): Result.Result<string, CreateMarkdownSectionError> {
  return Result.pipe(
    Result.succeed(item),
    Result.bind(
      'content',
      (v): Result.Result<string, ReadTextFileError> =>
        readTextFile({ filePath: v.filePath })
    ),
    Result.map((v): string =>
      adjustMarkdownHeadings({
        content: v.content,
        nestingLevel: v.nestingLevel
      })
    ),
    Result.map((v): string => v.replace(/\s+$/u, ''))
  );
}
