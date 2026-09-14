import { Result } from '@praha/byethrow';
import fse from 'fs-extra';
import { MPROVE_CONFIG_FILENAME } from '#common/constants/top';
import { ServerError } from '#common/models/server-error';
import type { BmlFile } from '#common/zod/blockml/bml-file';
import { readFileCheckSize } from '#node-common/functions-result/read-file-check-size';

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
