import { Result } from '@praha/byethrow';
import fse from 'fs-extra';

export async function isPathExist(item: {
  path: string;
}): Result.ResultAsync<boolean, never> {
  let { path } = item;

  let isExist: boolean = await fse.pathExists(path);

  return Result.succeed(isExist);
}
