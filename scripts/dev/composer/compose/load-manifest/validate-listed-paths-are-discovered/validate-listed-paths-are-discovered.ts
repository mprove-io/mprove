import { Result } from '@praha/byethrow';
import type { DiscoverPathsPayload } from '../../../types/discover-paths-payload';
import type { ValidateListedPathsAreDiscoveredError } from '../../../types/function-errors/validate-listed-paths-are-discovered-error';

export function validateListedPathsAreDiscovered(item: {
  discoverPathsPayload: DiscoverPathsPayload;
  listedPaths: string[];
}): Result.Result<void, ValidateListedPathsAreDiscoveredError> {
  let { discoverPathsPayload, listedPaths } = item;

  let discoveredFiles: Set<string> = new Set<string>(
    discoverPathsPayload.files
  );

  let missingRelativePaths: string[] = listedPaths.filter(
    relativePath => !discoveredFiles.has(relativePath)
  );

  return missingRelativePaths.length > 0
    ? Result.fail({
        code: 'COMPOSER_MANIFEST_REFERENCES_MISSING_FILE',
        message: `The manifest references missing Markdown file ${missingRelativePaths[0]}`,
        path: missingRelativePaths[0]
      })
    : Result.succeed();
}
