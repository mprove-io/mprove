import { posix, resolve } from 'node:path';
import { Result } from '@praha/byethrow';
import type { ValidateMarkdownTitlesError } from '../../../types/function-errors/validate-markdown-titles-error';

export function validateMarkdownTitles(item: {
  contentDirectory: string;
  contents: string[];
  relativePaths: string[];
}): Result.Result<void, ValidateMarkdownTitlesError> {
  let { contentDirectory, contents, relativePaths } = item;

  for (let i = 0; i < relativePaths.length; i++) {
    let relativePath: string = relativePaths[i];

    let filePath: string = resolve(contentDirectory, relativePath);

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

    let lines: string[] = contents[i].split(/\r?\n/u);

    let firstLine: string = lines[0] ?? '';

    let firstLineIsH1: boolean = /^# [^#].*$/u.test(firstLine);

    let title: string = firstLineIsH1 ? firstLine.slice(2).trim() : '';

    let titleSlug: string = title
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/gu, '-')
      .replace(/^-|-$/gu, '');

    let expectedFileName: string = `${titleSlug}.md`;

    let normalizedActualFileName: string = actualFileName.toLowerCase();

    let titleMatchesFileName: boolean =
      title.length > 0 && normalizedActualFileName === expectedFileName;

    if (!titleMatchesFileName) {
      return Result.fail({
        code: 'COMPOSER_MARKDOWN_TITLE_MISMATCH',
        message: `${filePath} first H1 must match filename ${actualFileName}`,
        filePath: filePath
      });
    }
  }

  return Result.succeed();
}
