import { Result } from '@praha/byethrow';
import type { DiscoverPathsPayload } from '../../../types/discover-paths-payload';
import type { ValidateDiscoveredFilesAreListedError } from '../../../types/function-errors/validate-discovered-files-are-listed-error';

export function validateDiscoveredFilesAreListed(item: {
  discoverPathsPayload: DiscoverPathsPayload;
  listedPaths: string[];
}): Result.Result<void, ValidateDiscoveredFilesAreListedError> {
  let { discoverPathsPayload, listedPaths } = item;

  let listedPathsSet: Set<string> = new Set<string>(listedPaths);

  let unreferencedRelativePaths: string[] = discoverPathsPayload.files.filter(
    relativePath => !listedPathsSet.has(relativePath)
  );

  return unreferencedRelativePaths.length > 0
    ? Result.fail({
        code: 'COMPOSER_MARKDOWN_FILE_UNREFERENCED',
        message: `${unreferencedRelativePaths[0]} is not referenced in the manifest`,
        path: unreferencedRelativePaths[0]
      })
    : Result.succeed();
}
