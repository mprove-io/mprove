import { Result } from '@praha/byethrow';
import type { ValidateManifestPathsUniqueError } from '../../../types/function-errors/validate-manifest-paths-unique-error';
import type { ManifestLine } from '../../../types/manifest-line';

export function validateManifestPathsUnique(item: {
  listedPaths: string[];
  manifestLines: ManifestLine[];
  manifestPath: string;
}): Result.Result<void, ValidateManifestPathsUniqueError> {
  let { listedPaths, manifestLines, manifestPath } = item;

  let referencedPaths: Set<string> = new Set<string>();

  for (let i = 0; i < listedPaths.length; i++) {
    let listedPath: string = listedPaths[i];

    if (referencedPaths.has(listedPath)) {
      return Result.fail({
        code: 'COMPOSER_MANIFEST_PATH_DUPLICATE',
        message: `${manifestPath}:${manifestLines[i].lineNumber} references ${listedPath} more than once`,
        path: listedPath
      });
    }

    referencedPaths.add(listedPath);
  }

  return Result.succeed();
}
