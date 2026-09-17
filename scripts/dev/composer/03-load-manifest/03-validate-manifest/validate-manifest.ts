import { Result } from '@praha/byethrow';
import type { ComposerError } from '../../types/errors/composer-error';
import type { Manifest } from '../../types/manifest';
import { validateMarkdownTitle } from './01-validate-markdown-title/validate-markdown-title';
import { getMarkdownFilePaths } from './02-get-markdown-file-paths/get-markdown-file-paths';

export function validateManifest(item: {
  ignoredRelativePaths: string[];
  manifest: Manifest;
  sourceDirectory: string;
}): Result.Result<void, ComposerError> {
  let { ignoredRelativePaths, manifest, sourceDirectory } = item;

  let validationResult: Result.Result<void, ComposerError> = Result.succeed();

  for (let i = 0; i < manifest.relativePaths.length; i++) {
    let relativePath: string = manifest.relativePaths[i];

    validationResult = Result.pipe(
      Result.succeed(validationResult),
      Result.andThen(
        (
          currentResult: Result.Result<void, ComposerError>
        ): Result.Result<void, ComposerError> => currentResult
      ),
      Result.andThen(
        (): Result.Result<void, ComposerError> =>
          validateMarkdownTitle({
            relativePath: relativePath,
            sourceDirectory: sourceDirectory
          })
      )
    );
  }

  let markdownPathsResult: Result.Result<string[], ComposerError> = Result.pipe(
    Result.succeed(validationResult),
    Result.andThen(
      (
        currentResult: Result.Result<void, ComposerError>
      ): Result.Result<void, ComposerError> => currentResult
    ),
    Result.andThen(
      (): Result.Result<string[], ComposerError> =>
        getMarkdownFilePaths({ sourceDirectory: sourceDirectory })
    )
  );

  return Result.pipe(
    Result.succeed(markdownPathsResult),
    Result.andThen(
      (
        currentResult: Result.Result<string[], ComposerError>
      ): Result.Result<string[], ComposerError> => currentResult
    ),
    Result.andThen(
      (markdownPaths: string[]): Result.Result<void, ComposerError> => {
        let ignoredPaths: Set<string> = new Set<string>(ignoredRelativePaths);

        let sourceMarkdownPaths: string[] = markdownPaths.filter(
          markdownPath => !ignoredPaths.has(markdownPath)
        );

        let referencedPaths: Set<string> = new Set<string>(
          manifest.relativePaths
        );

        for (let i = 0; i < ignoredRelativePaths.length; i++) {
          let ignoredPath: string = ignoredRelativePaths[i];

          let isReferenced: boolean = referencedPaths.has(ignoredPath);

          if (isReferenced) {
            return Result.fail({
              code: 'COMPOSER_IGNORED_PATH_REFERENCED',
              message: `${ignoredPath} cannot be referenced in the manifest`,
              path: ignoredPath
            });
          }
        }

        for (let i = 0; i < sourceMarkdownPaths.length; i++) {
          let markdownPath: string = sourceMarkdownPaths[i];

          let isReferenced: boolean = referencedPaths.has(markdownPath);

          if (!isReferenced) {
            return Result.fail({
              code: 'COMPOSER_MARKDOWN_FILE_UNREFERENCED',
              message: `${markdownPath} is not referenced in the manifest`,
              path: markdownPath
            });
          }
        }

        if (referencedPaths.size !== sourceMarkdownPaths.length) {
          return Result.fail({
            code: 'COMPOSER_MANIFEST_REFERENCES_MISSING_FILE',
            message: 'The manifest references a missing Markdown file',
            path: sourceDirectory
          });
        }

        return Result.succeed();
      }
    )
  );
}
