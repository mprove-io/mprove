import { Result } from '@praha/byethrow';
import fse from 'fs-extra';

export async function removePath(item: {
  path: string;
}): Result.ResultAsync<void, never> {
  await fse.remove(item.path);

  return Result.succeed();
}
