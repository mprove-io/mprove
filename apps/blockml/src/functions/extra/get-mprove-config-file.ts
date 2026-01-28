import * as fse from 'fs-extra';
import { MPROVE_CONFIG_FILENAME } from '#common/constants/top';
import { BmlFile } from '#common/interfaces/blockml/bml-file';
import { readFileCheckSize } from '#node-common/functions/read-file-check-size';

export async function getMproveConfigFile(configPath: string) {
  let isPathExist = await fse.pathExists(configPath);

  if (isPathExist === false) {
    return undefined;
  }

  let configStat = await fse.stat(configPath);
  if (configStat.isFile() === false) {
    return undefined;
  }

  let { content } = await readFileCheckSize({
    filePath: configPath,
    getStat: false
  });

  let file: BmlFile = {
    name: MPROVE_CONFIG_FILENAME,
    path: MPROVE_CONFIG_FILENAME,
    content: content
  };

  return file;
}
