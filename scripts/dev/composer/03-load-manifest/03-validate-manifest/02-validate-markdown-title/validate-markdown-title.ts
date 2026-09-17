import { posix, resolve } from 'node:path';
import { Result } from '@praha/byethrow';
import { readTextFile } from '../../../shared/read-text-file/read-text-file';
import type { ComposerError } from '../../../types/errors/composer-error';
import { toTitleSlug } from './02-to-title-slug/to-title-slug';

export function validateMarkdownTitle(item: {
  relativePath: string;
  sourceDirectory: string;
}): Result.Result<void, ComposerError> {
  let { relativePath, sourceDirectory } = item;

  let filePath: string = resolve(sourceDirectory, relativePath);

  let actualFileName: string = posix.basename(relativePath);

  let fileNameStem: string = posix.basename(relativePath, '.md');

  let fileNameIsValid: boolean = /^[a-z0-9-]+$/u.test(fileNameStem);

  if (!fileNameIsValid) {
    return Result.fail({
      code: 'COMPOSER_SOURCE_FILE_NAME_INVALID',
      message: `${filePath} filename may contain only lowercase a-z, 0-9, and hyphens`,
      filePath: filePath
    });
  }

  return Result.pipe(
    Result.succeed(filePath),
    Result.andThen(path => readTextFile({ filePath: path })),
    Result.andThen(content => {
      let lines: string[] = content.split(/\r?\n/u);

      let firstLine: string = lines[0] ?? '';

      let firstLineIsH1: boolean = /^# [^#].*$/u.test(firstLine);

      let title: string = firstLineIsH1 ? firstLine.slice(2).trim() : '';

      let expectedFileName: string = `${toTitleSlug({ title: title })}.md`;

      let normalizedActualFileName: string = actualFileName.toLowerCase();

      let titleMatchesFileName: boolean =
        title.length > 0 && normalizedActualFileName === expectedFileName;

      return titleMatchesFileName
        ? Result.succeed()
        : Result.fail({
            code: 'COMPOSER_MARKDOWN_TITLE_MISMATCH',
            message: `${filePath} first H1 must match filename ${actualFileName}`,
            filePath: filePath
          });
    })
  );
}
