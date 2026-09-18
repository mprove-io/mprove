import { resolve } from 'node:path';
import { Result } from '@praha/byethrow';
import { readTextFile } from '../../shared/read-text-file/read-text-file';
import type { CreateMarkdownError } from '../../types/function-errors/create-markdown-error';
import type { ReadTextFileError } from '../../types/function-errors/read-text-file-error';
import type { ValidateMarkdownTitlesError } from '../../types/function-errors/validate-markdown-titles-error';
import type { MarkdownSection } from '../../types/markdown-section';
import {
  adjustMarkdownLine,
  type MarkdownAdjustmentState
} from './adjust-markdown-line/adjust-markdown-line';
import { joinMarkdownSections } from './join-markdown-sections/join-markdown-sections';
import { validateMarkdownTitles } from './validate-markdown-titles/validate-markdown-titles';

type MarkdownPart = {
  lines: string[];
  nestingLevel: number;
  state: MarkdownAdjustmentState;
};

export function createMarkdown(item: {
  contentDirectory: string;
  relativePaths: string[];
}): Result.Result<string, CreateMarkdownError> {
  return Result.pipe(
    Result.succeed(item),
    Result.bind(
      'contents',
      (v): Result.Result<string[], ReadTextFileError> =>
        Result.sequence(v.relativePaths, relativePath =>
          readTextFile({
            filePath: resolve(v.contentDirectory, relativePath)
          })
        )
    ),
    Result.andThrough(
      (v): Result.Result<void, ValidateMarkdownTitlesError> =>
        validateMarkdownTitles({
          contentDirectory: v.contentDirectory,
          contents: v.contents,
          relativePaths: v.relativePaths
        })
    ),
    Result.map((v): MarkdownPart[] =>
      v.contents.map((content, index) => ({
        lines: content.split(/\r?\n/u),
        nestingLevel: v.relativePaths[index].split('/').length - 1,
        state: {
          openFenceCharacter: '',
          openFenceLength: 0
        }
      }))
    ),
    Result.map((v): MarkdownSection[] =>
      v.map(markdownPart => ({
        lines: markdownPart.lines.map(line =>
          adjustMarkdownLine({
            line: line,
            nestingLevel: markdownPart.nestingLevel,
            state: markdownPart.state
          })
        )
      }))
    ),
    Result.andThen(
      (v): Result.Result<string, never> => joinMarkdownSections({ sections: v })
    )
  );
}
