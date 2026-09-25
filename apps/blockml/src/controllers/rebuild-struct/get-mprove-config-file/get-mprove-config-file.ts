import { Result } from '@praha/byethrow';
import fse from 'fs-extra';
import { ServerError } from '#common/classes/server-error';
import { MPROVE_CONFIG_FILENAME } from '#common/constants/top';
import type { BmlFile } from '#common/zod/blockml/bml-file';
import { readFileCheckSize } from '#node-common/functions/read-file-check-size/read-file-check-size';

export async function getMproveConfigFile(configPath: string) {
  let isPathExist = await fse.pathExists(configPath);

  if (isPathExist === false) {
    return undefined;
  }

  let configStat = await fse.stat(configPath);
  if (configStat.isFile() === false) {
    return undefined;
  }

  let { content } = await Result.unwrap(
    Result.pipe(
      readFileCheckSize({
        filePath: configPath,
        getStat: false
      }),
      Result.mapError(error => new ServerError({ message: error.code }))
    )
  );

  let file: BmlFile = {
    name: MPROVE_CONFIG_FILENAME,
    path: MPROVE_CONFIG_FILENAME,
    content: content
  };

  return file;
}
