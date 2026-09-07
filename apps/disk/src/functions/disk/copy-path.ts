import { Result } from '@praha/byethrow';
import fse from 'fs-extra';

export async function copyPath(item: {
  sourcePath: string;
  destinationPath: string;
}): Result.ResultAsync<void, never> {
  await fse.copy(item.sourcePath, item.destinationPath);

  return Result.succeed();
}
