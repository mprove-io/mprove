import { Result } from '@praha/byethrow';
import fse from 'fs-extra';

export async function removeRebuildStructTempDir(item: {
  tempDir: string;
  isTest: boolean;
}): Result.ResultAsync<void, never> {
  if (item.isTest === true) {
    await fse.remove(item.tempDir);
  } else {
    fse.remove(item.tempDir);
  }

  return Result.succeed();
}
