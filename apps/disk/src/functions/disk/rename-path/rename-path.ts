import { Result } from '@praha/byethrow';
import fse from 'fs-extra';

export async function renamePath(item: {
  oldPath: string;
  newPath: string;
}): Result.ResultAsync<void, never> {
  await fse.rename(item.oldPath, item.newPath);

  return Result.succeed();
}
