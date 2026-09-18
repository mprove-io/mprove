import { Result } from '@praha/byethrow';
import type { ValidateManifestPathsError } from '../../../types/function-errors/validate-manifest-paths-error';

export function validateManifestPaths(item: {
  manifestRelativePaths: string[];
  markdownPaths: string[];
}): Result.Result<void, ValidateManifestPathsError> {
  let { manifestRelativePaths, markdownPaths } = item;

  let referencedPaths: Set<string> = new Set<string>(manifestRelativePaths);

  let contentPaths: Set<string> = new Set<string>(markdownPaths);

  for (let i = 0; i < markdownPaths.length; i++) {
    let markdownPath: string = markdownPaths[i];

    if (!referencedPaths.has(markdownPath)) {
      return Result.fail({
        code: 'COMPOSER_MARKDOWN_FILE_UNREFERENCED',
        message: `${markdownPath} is not referenced in the manifest`,
        path: markdownPath
      });
    }
  }

  let missingPaths: string[] = manifestRelativePaths.filter(
    relativePath => !contentPaths.has(relativePath)
  );

  if (missingPaths.length > 0) {
    return Result.fail({
      code: 'COMPOSER_MANIFEST_REFERENCES_MISSING_FILE',
      message: `The manifest references missing Markdown file ${missingPaths[0]}`,
      path: missingPaths[0]
    });
  }

  return Result.succeed();
}
