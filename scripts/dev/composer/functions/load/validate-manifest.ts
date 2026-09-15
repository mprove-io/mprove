import { Result } from '@praha/byethrow';
import type { ScriptError } from '../../types/errors/script-error';
import type { Manifest } from '../../types/manifest';
import { getMarkdownFilePaths } from './get-markdown-file-paths';
import { validateMarkdownTitle } from './validate-markdown-title';

export function validateManifest(item: {
  ignoredRelativePaths: string[];
  manifest: Manifest;
  sourceDirectory: string;
}): Result.Result<void, ScriptError> {
  let { ignoredRelativePaths, manifest, sourceDirectory } = item;

  let validationResult: Result.Result<void, ScriptError> = Result.succeed();

  for (let i = 0; i < manifest.relativePaths.length; i++) {
    let relativePath: string = manifest.relativePaths[i];

    validationResult = Result.pipe(
      Result.succeed(validationResult),
      Result.andThen(
        (
          currentResult: Result.Result<void, ScriptError>
        ): Result.Result<void, ScriptError> => currentResult
      ),
      Result.andThen(
        (): Result.Result<void, ScriptError> =>
          validateMarkdownTitle({
            relativePath: relativePath,
            sourceDirectory: sourceDirectory
          })
      )
    );
  }

  let markdownPathsResult: Result.Result<string[], ScriptError> = Result.pipe(
    Result.succeed(validationResult),
    Result.andThen(
      (
        currentResult: Result.Result<void, ScriptError>
      ): Result.Result<void, ScriptError> => currentResult
    ),
    Result.andThen(
      (): Result.Result<string[], ScriptError> =>
        getMarkdownFilePaths({ sourceDirectory: sourceDirectory })
    )
  );

  return Result.pipe(
    Result.succeed(markdownPathsResult),
    Result.andThen(
      (
        currentResult: Result.Result<string[], ScriptError>
      ): Result.Result<string[], ScriptError> => currentResult
    ),
    Result.andThen(
      (markdownPaths: string[]): Result.Result<void, ScriptError> => {
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
              code: 'SCRIPT_MARKDOWN_REFERENCE_ERROR',
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
              code: 'SCRIPT_MARKDOWN_REFERENCE_ERROR',
              message: `${markdownPath} is not referenced in the manifest`,
              path: markdownPath
            });
          }
        }

        if (referencedPaths.size !== sourceMarkdownPaths.length) {
          return Result.fail({
            code: 'SCRIPT_MARKDOWN_REFERENCE_ERROR',
            message: 'The manifest references a missing Markdown file',
            path: sourceDirectory
          });
        }

        return Result.succeed();
      }
    )
  );
}
