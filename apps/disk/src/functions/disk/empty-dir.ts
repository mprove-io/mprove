import { Result } from '@praha/byethrow';
import fse from 'fs-extra';

export async function emptyDir(item: {
  dir: string;
}): Result.ResultAsync<void, never> {
  await fse.emptyDir(item.dir);

  return Result.succeed();
}
