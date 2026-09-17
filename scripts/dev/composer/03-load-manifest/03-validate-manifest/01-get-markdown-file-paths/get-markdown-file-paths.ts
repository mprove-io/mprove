import { Result } from '@praha/byethrow';
import type { ComposerError } from '../../../types/errors/composer-error';
import { collectMarkdownFilePathsRecursive } from './01-collect-markdown-file-paths-recursive/collect-markdown-file-paths-recursive';

export function getMarkdownFilePaths(item: {
  sourceDirectory: string;
}): Result.Result<string[], ComposerError> {
  let { sourceDirectory } = item;

  let scanState: { currentDirectory: string } = {
    currentDirectory: sourceDirectory
  };

  return Result.pipe(
    Result.succeed({
      scanState: scanState,
      sourceDirectory: sourceDirectory
    }),
    Result.andThen(
      (v): Result.Result<string[], ComposerError> =>
        Result.try({
          try: (): string[] =>
            collectMarkdownFilePathsRecursive({
              currentDirectory: v.sourceDirectory,
              relativeDirectory: '',
              scanState: v.scanState
            }),
          catch: (error: unknown): ComposerError => ({
            code: 'COMPOSER_MARKDOWN_FILE_SCAN_FAILED',
            message: `Unable to scan ${v.scanState.currentDirectory}`,
            path: v.scanState.currentDirectory,
            originalError: error
          })
        })
    )
  );
}
