import { Result } from '@praha/byethrow';
import { readTextFile } from '../../shared/read-text-file/read-text-file';
import type { ComposerError } from '../../types/errors/composer-error';
import { adjustMarkdownHeadings } from './02-adjust-markdown-headings/adjust-markdown-headings';

export function createMarkdownSection(item: {
  filePath: string;
  nestingLevel: number;
}): Result.Result<string, ComposerError> {
  return Result.pipe(
    Result.succeed(item),
    Result.bind(
      'content',
      (v): Result.Result<string, ComposerError> =>
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
