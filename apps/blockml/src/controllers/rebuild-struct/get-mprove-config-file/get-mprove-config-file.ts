import { Result } from '@praha/byethrow';
import fse from 'fs-extra';
import { ServerError } from '#common/classes/server-error/server-error';
import { MPROVE_CONFIG_FILENAME } from '#common/constants/top';
import type { BmlFile } from '#common/types/blockml/parts/file/bml-file';
import type { ReadFileCheckSizeError } from '#common/types/node-common/function-errors/read-file-check-size-error';
import {
  type ReadFileCheckSizeOutput,
  readFileCheckSize
} from '#node-common/functions/read-file-check-size/read-file-check-size';

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
      Result.succeed({
        filePath: configPath,
        getStat: false
      }),
      Result.andThen(
        (
          v
        ): Result.ResultAsync<
          ReadFileCheckSizeOutput,
          ReadFileCheckSizeError
        > => readFileCheckSize({ filePath: v.filePath, getStat: v.getStat })
      ),
      Result.mapError(v => new ServerError({ message: v.code }))
    )
  );

  let file: BmlFile = {
    name: MPROVE_CONFIG_FILENAME,
    path: MPROVE_CONFIG_FILENAME,
    content: content
  };

  return file;
}
