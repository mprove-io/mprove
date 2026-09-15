import { posix, resolve } from 'node:path';
import { Result } from '@praha/byethrow';
import type { ScriptError } from '../../types/errors/script-error';
import { readTextFile } from '../parts/read-text-file';
import { toTitleSlug } from '../parts/to-title-slug';

export function validateMarkdownTitle(item: {
  relativePath: string;
  sourceDirectory: string;
}): Result.Result<void, ScriptError> {
  let { relativePath, sourceDirectory } = item;

  let filePath: string = resolve(sourceDirectory, relativePath);

  return Result.pipe(
    Result.succeed(filePath),
    Result.andThen(path => readTextFile({ filePath: path })),
    Result.andThen(content => {
      let lines: string[] = content.split(/\r?\n/u);

      let firstContentLine: string =
        lines.find(line => line.trim().length > 0) ?? '';

      let titleMatch: RegExpMatchArray | null =
        firstContentLine.match(/^# ([^#].*)$/u);

      let title: string = titleMatch === null ? '' : titleMatch[1].trim();

      let expectedFileName: string = `${toTitleSlug({ title: title })}.md`;

      let actualFileName: string = posix.basename(relativePath);

      return title.length > 0 && actualFileName === expectedFileName
        ? Result.succeed()
        : Result.fail({
            code: 'SCRIPT_TITLE_MISMATCH_ERROR',
            message: `${filePath} first H1 must match filename ${actualFileName}`,
            filePath: filePath
          });
    })
  );
}
