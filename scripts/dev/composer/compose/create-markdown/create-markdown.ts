import { resolve } from 'node:path';
import { Result } from '@praha/byethrow';
import { readTextFile } from '../../shared/read-text-file/read-text-file';
import type { CreateMarkdownError } from '../../types/function-errors/create-markdown-error';
import type { ReadTextFileError } from '../../types/function-errors/read-text-file-error';
import type { ValidateMarkdownTitlesError } from '../../types/function-errors/validate-markdown-titles-error';
import type { MarkdownSection } from '../../types/markdown-section';
import { adjustMarkdownLine } from './adjust-markdown-line/adjust-markdown-line';
import { joinMarkdownSections } from './join-markdown-sections/join-markdown-sections';
import { validateMarkdownTitles } from './validate-markdown-titles/validate-markdown-titles';

export function createMarkdown(item: {
  contentDirectory: string;
  listedPaths: string[];
}): Result.Result<string, CreateMarkdownError> {
  return Result.pipe(
    Result.succeed(item),
    Result.bind(
      'contents',
      (v): Result.Result<string[], ReadTextFileError> =>
        Result.sequence(v.listedPaths, listedPath =>
          readTextFile({
            filePath: resolve(v.contentDirectory, listedPath)
          })
        )
    ),
    Result.andThrough(
      (v): Result.Result<void, ValidateMarkdownTitlesError> =>
        validateMarkdownTitles({
          contentDirectory: v.contentDirectory,
          contents: v.contents,
          listedPaths: v.listedPaths
        })
    ),
    Result.map((v): MarkdownSection[] =>
      v.contents.map((content, index) => ({
        lines: content.split(/\r?\n/u).map(line =>
          adjustMarkdownLine({
            line: line,
            nestingLevel: v.listedPaths[index].split('/').length - 1
          })
        )
      }))
    ),
    Result.andThen(
      (v): Result.Result<string, never> => joinMarkdownSections({ sections: v })
    )
  );
}
