import { Result } from '@praha/byethrow';
import type { ValidateManifestOutputPathConflictError } from '../../../types/function-errors/validate-manifest-output-path-conflict-error';

export function validateManifestOutputPathConflict(item: {
  manifestPath: string;
  outputPath: string;
}): Result.Result<void, ValidateManifestOutputPathConflictError> {
  return item.manifestPath === item.outputPath
    ? Result.fail({
        code: 'COMPOSER_MANIFEST_OUTPUT_PATH_CONFLICT',
        message: 'The manifest and output paths must be different'
      })
    : Result.succeed();
}
