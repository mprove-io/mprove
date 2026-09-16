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

  let actualFileName: string = posix.basename(relativePath);

  let fileNameStem: string = posix.basename(relativePath, '.md');

  let fileNameIsValid: boolean = /^[a-z0-9-]+$/u.test(fileNameStem);

  if (!fileNameIsValid) {
    return Result.fail({
      code: 'SCRIPT_INVALID_SOURCE_FILE_NAME_ERROR',
      message: `${filePath} filename may contain only lowercase a-z, 0-9, and hyphens`,
      filePath: filePath
    });
  }

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

      let normalizedExpectedFileName: string = expectedFileName.toLowerCase();

      let normalizedActualFileName: string = actualFileName.toLowerCase();

      let titleMatchesFileName: boolean =
        title.length > 0 &&
        normalizedActualFileName === normalizedExpectedFileName;

      return titleMatchesFileName
        ? Result.succeed()
        : Result.fail({
            code: 'SCRIPT_TITLE_MISMATCH_ERROR',
            message: `${filePath} first H1 must match filename ${actualFileName}`,
            filePath: filePath
          });
    })
  );
}
