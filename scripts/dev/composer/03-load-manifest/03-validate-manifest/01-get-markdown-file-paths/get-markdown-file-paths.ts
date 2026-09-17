import { Result } from '@praha/byethrow';
import type { ComposerMarkdownFileScanFailedError } from '../../../types/errors/composer-markdown-file-scan-failed-error';
import type { GetMarkdownFilePathsError } from '../../../types/function-errors/get-markdown-file-paths-error';
import { collectMarkdownFilePathsRecursive } from './01-collect-markdown-file-paths-recursive/collect-markdown-file-paths-recursive';

export function getMarkdownFilePaths(item: {
  sourceDirectory: string;
}): Result.Result<string[], GetMarkdownFilePathsError> {
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
      (v): Result.Result<string[], ComposerMarkdownFileScanFailedError> =>
        Result.try({
          try: (): string[] =>
            collectMarkdownFilePathsRecursive({
              currentDirectory: v.sourceDirectory,
              relativeDirectory: '',
              scanState: v.scanState
            }),
          catch: (error: unknown): ComposerMarkdownFileScanFailedError => ({
            code: 'COMPOSER_MARKDOWN_FILE_SCAN_FAILED',
            message: `Unable to scan ${v.scanState.currentDirectory}`,
            path: v.scanState.currentDirectory,
            originalError: error
          })
        })
    )
  );
}
