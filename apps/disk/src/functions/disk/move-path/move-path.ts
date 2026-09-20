import { Result } from '@praha/byethrow';
import fse from 'fs-extra';

export async function movePath(item: {
  sourcePath: string;
  destinationPath: string;
}): Result.ResultAsync<void, never> {
  await fse.move(item.sourcePath, item.destinationPath);

  return Result.succeed();
}
