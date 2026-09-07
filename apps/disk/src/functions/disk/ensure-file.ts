import { Result } from '@praha/byethrow';
import fse from 'fs-extra';

// auto creates new folders in path
export async function ensureFile(item: {
  filePath: string;
}): Result.ResultAsync<void, never> {
  await fse.ensureFile(item.filePath);

  return Result.succeed();
}
