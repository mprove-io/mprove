import { Result } from '@praha/byethrow';
import type { ComposerError } from '../../types/errors/composer-error';
import type { Manifest } from '../../types/manifest';
import { getMarkdownFilePaths } from './01-get-markdown-file-paths/get-markdown-file-paths';
import { validateMarkdownTitle } from './02-validate-markdown-title/validate-markdown-title';

export function validateManifest(item: {
  ignoredRelativePaths: string[];
  manifest: Manifest;
  sourceDirectory: string;
}): Result.Result<void, ComposerError> {
  let { ignoredRelativePaths, manifest, sourceDirectory } = item;

  return Result.pipe(
    Result.succeed(item),
    Result.andThen(
      (v): Result.Result<string[], ComposerError> =>
        getMarkdownFilePaths({ sourceDirectory: v.sourceDirectory })
    ),
    Result.andThen((v: string[]): Result.Result<void, ComposerError> => {
      let ignoredPaths: Set<string> = new Set<string>(ignoredRelativePaths);

      let sourceMarkdownPaths: string[] = v.filter(
        markdownPath => !ignoredPaths.has(markdownPath)
      );

      let referencedPaths: Set<string> = new Set<string>(
        manifest.relativePaths
      );

      let sourcePaths: Set<string> = new Set<string>(sourceMarkdownPaths);

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

      let missingPaths: string[] = manifest.relativePaths.filter(
        relativePath => !sourcePaths.has(relativePath)
      );

      let hasMissingPath: boolean = missingPaths.length > 0;

      if (hasMissingPath) {
        return Result.fail({
          code: 'COMPOSER_MANIFEST_REFERENCES_MISSING_FILE',
          message: `The manifest references missing Markdown file ${missingPaths[0]}`,
          path: missingPaths[0]
        });
      }

      let titleValidationResult: Result.Result<void, ComposerError> =
        Result.succeed();

      for (let i = 0; i < manifest.relativePaths.length; i++) {
        let relativePath: string = manifest.relativePaths[i];

        titleValidationResult = Result.andThen(
          (v: void): Result.Result<void, ComposerError> => {
            void v;

            return validateMarkdownTitle({
              relativePath: relativePath,
              sourceDirectory: sourceDirectory
            });
          }
        )(titleValidationResult);
      }

      return titleValidationResult;
    })
  );
}
