import { Result } from '@praha/byethrow';
import type { ValidateMarkdownFilesReferencedError } from '../../../types/function-errors/validate-markdown-files-referenced-error';

export function validateMarkdownFilesReferenced(item: {
  manifestRelativePaths: string[];
  markdownRelativePaths: string[];
}): Result.Result<void, ValidateMarkdownFilesReferencedError> {
  let manifestRelativePaths: Set<string> = new Set<string>(
    item.manifestRelativePaths
  );

  let unreferencedRelativePaths: string[] = item.markdownRelativePaths.filter(
    relativePath => !manifestRelativePaths.has(relativePath)
  );

  return unreferencedRelativePaths.length > 0
    ? Result.fail({
        code: 'COMPOSER_MARKDOWN_FILE_UNREFERENCED',
        message: `${unreferencedRelativePaths[0]} is not referenced in the manifest`,
        path: unreferencedRelativePaths[0]
      })
    : Result.succeed();
}
