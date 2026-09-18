import { resolve } from 'node:path';
import { Result } from '@praha/byethrow';
import { readTextFile } from '../shared/read-text-file/read-text-file';
import type { ComposeInput } from '../types/compose-input';
import type { ComposeError } from '../types/function-errors/compose-error';
import type { LoadManifestError } from '../types/function-errors/load-manifest-error';
import type { ReadTextFileError } from '../types/function-errors/read-text-file-error';
import type { ValidateInputError } from '../types/function-errors/validate-input-error';
import type { ValidateMarkdownTitlesError } from '../types/function-errors/validate-markdown-titles-error';
import type { Manifest } from '../types/manifest';
import {
  adjustMarkdownLine,
  type MarkdownAdjustmentState
} from './adjust-markdown-line/adjust-markdown-line';
import { joinMarkdownSections } from './join-markdown-sections/join-markdown-sections';
import { loadManifest } from './load-manifest/load-manifest';
import { validateInput } from './validate-input/validate-input';
import { validateMarkdownTitles } from './validate-markdown-titles/validate-markdown-titles';
import { writeOutput } from './write-output/write-output';

export function compose(item: {
  argv: string[];
}): Result.Result<void, ComposeError> {
  return Result.pipe(
    Result.succeed(item),
    Result.andThen(
      (v): Result.Result<ComposeInput, ValidateInputError> =>
        validateInput({ argv: v.argv })
    ),
    Result.bind(
      'manifest',
      (v): Result.Result<Manifest, LoadManifestError> =>
        loadManifest({
          contentDirectory: v.contentDirectory,
          manifestPath: v.manifestPath
        })
    ),
    Result.bind(
      'contents',
      (v): Result.Result<string[], ReadTextFileError> =>
        Result.sequence(v.manifest.relativePaths, relativePath =>
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
          relativePaths: v.manifest.relativePaths
        })
    ),
    Result.bind(
      'adjustedContentLines',
      (v): Result.Result<string[][], never> =>
        Result.sequence(
          v.contents.map((content, index) => {
            let state: MarkdownAdjustmentState = {
              openFenceCharacter: '',
              openFenceLength: 0
            };

            return Result.sequence(content.split(/\r?\n/u), line =>
              adjustMarkdownLine({
                line: line,
                nestingLevel:
                  v.manifest.relativePaths[index].split('/').length - 1,
                state: state
              })
            );
          })
        )
    ),
    Result.bind(
      'markdown',
      (v): Result.Result<string, never> =>
        joinMarkdownSections({ contentLines: v.adjustedContentLines })
    ),
    Result.andThrough(v =>
      writeOutput({ markdown: v.markdown, outputPath: v.outputPath })
    ),
    Result.map((v): void => {
      console.log(`Wrote ${v.outputPath}`);
    })
  );
}
