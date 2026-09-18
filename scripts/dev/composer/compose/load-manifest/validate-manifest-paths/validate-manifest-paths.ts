import { Result } from '@praha/byethrow';
import type { ValidateManifestPathsError } from '../../../types/function-errors/validate-manifest-paths-error';

export function validateManifestPaths(item: {
  ignoredRelativePaths: string[];
  manifestRelativePaths: string[];
  markdownPaths: string[];
}): Result.Result<void, ValidateManifestPathsError> {
  let { ignoredRelativePaths, manifestRelativePaths, markdownPaths } = item;

  let ignoredPaths: Set<string> = new Set<string>(ignoredRelativePaths);

  let sourceMarkdownPaths: string[] = markdownPaths.filter(
    markdownPath => !ignoredPaths.has(markdownPath)
  );

  let referencedPaths: Set<string> = new Set<string>(manifestRelativePaths);

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

  let missingPaths: string[] = manifestRelativePaths.filter(
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

  return Result.succeed();
}
