import { Result } from '@praha/byethrow';
import type { ValidateManifestAndOutputPathsDifferentError } from '../../../types/function-errors/validate-manifest-and-output-paths-different-error';

export function validateManifestAndOutputPathsDifferent(item: {
  manifestPath: string;
  outputPath: string;
}): Result.Result<void, ValidateManifestAndOutputPathsDifferentError> {
  return item.manifestPath === item.outputPath
    ? Result.fail({
        code: 'COMPOSER_MANIFEST_OUTPUT_PATH_CONFLICT',
        message: 'The manifest and output paths must be different'
      })
    : Result.succeed();
}
