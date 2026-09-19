import { posix, resolve } from 'node:path';
import { Result } from '@praha/byethrow';
import type { ValidateMarkdownTitlesError } from '../../../types/function-errors/validate-markdown-titles-error';

export function validateMarkdownTitles(item: {
  contentDirectory: string;
  contents: string[];
  listedPaths: string[];
}): Result.Result<void, ValidateMarkdownTitlesError> {
  let { contentDirectory, contents, listedPaths } = item;

  for (let i = 0; i < listedPaths.length; i++) {
    let listedPath: string = listedPaths[i];

    let filePath: string = resolve(contentDirectory, listedPath);

    let actualFileName: string = posix.basename(listedPath);

    let lines: string[] = contents[i].split(/\r?\n/u);

    let firstLine: string = lines[0] ?? '';

    let isFirstLineH1: boolean = /^# [^#].*$/u.test(firstLine);

    let title: string = isFirstLineH1 ? firstLine.slice(2).trim() : '';

    let titleSlug: string = title
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/gu, '-')
      .replace(/^-|-$/gu, '');

    let expectedFileName: string = `${titleSlug}.md`;

    let normalizedActualFileName: string = actualFileName.toLowerCase();

    let isTitleMatchingFileName: boolean =
      title.length > 0 && normalizedActualFileName === expectedFileName;

    if (!isTitleMatchingFileName) {
      return Result.fail({
        code: 'COMPOSER_MARKDOWN_TITLE_MISMATCH',
        message: `${filePath} first H1 must match filename ${actualFileName}`,
        filePath: filePath
      });
    }
  }

  return Result.succeed();
}
