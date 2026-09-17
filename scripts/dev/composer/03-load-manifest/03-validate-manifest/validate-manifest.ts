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
  return Result.pipe(
    Result.succeed(item),
    Result.bind('markdownPaths', v =>
      getMarkdownFilePaths({ sourceDirectory: v.sourceDirectory })
    ),
    Result.andThen((v): Result.Result<void, ComposerError> => {
      let ignoredPaths: Set<string> = new Set<string>(v.ignoredRelativePaths);

      let sourceMarkdownPaths: string[] = v.markdownPaths.filter(
        markdownPath => !ignoredPaths.has(markdownPath)
      );

      let referencedPaths: Set<string> = new Set<string>(
        v.manifest.relativePaths
      );

      let sourcePaths: Set<string> = new Set<string>(sourceMarkdownPaths);

      for (let i = 0; i < v.ignoredRelativePaths.length; i++) {
        let ignoredPath: string = v.ignoredRelativePaths[i];

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

      let missingPaths: string[] = v.manifest.relativePaths.filter(
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

      let titleValidationResult: Result.Result<
        { relativePaths: string[]; sourceDirectory: string },
        ComposerError
      > = Result.succeed({
        relativePaths: v.manifest.relativePaths,
        sourceDirectory: v.sourceDirectory
      });

      for (let i = 0; i < v.manifest.relativePaths.length; i++) {
        titleValidationResult = Result.andThrough(
          (v: {
            relativePaths: string[];
            sourceDirectory: string;
          }): Result.Result<void, ComposerError> =>
            validateMarkdownTitle({
              relativePath: v.relativePaths[i],
              sourceDirectory: v.sourceDirectory
            })
        )(titleValidationResult);
      }

      return Result.map(
        (v: { relativePaths: string[]; sourceDirectory: string }): void => {
          void v;
        }
      )(titleValidationResult);
    })
  );
}
