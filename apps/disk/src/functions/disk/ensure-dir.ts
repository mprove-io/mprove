import { Result } from '@praha/byethrow';
import fse from 'fs-extra';

export async function ensureDir(item: {
  dir: string;
}): Result.ResultAsync<void, never> {
  await fse.ensureDir(item.dir);

  return Result.succeed();
}
