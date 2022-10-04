import * as fse from 'fs-extra';
import { BmlFile } from '~common/interfaces/blockml/bml-file';
import { MPROVE_CONFIG_FILENAME } from '~common/_index';

export async function getMproveConfigFile(configPath: string) {
  let isPathExist = await fse.pathExists(configPath);

  if (isPathExist === false) {
    return undefined;
  }

  let configStat = await fse.stat(configPath);
  if (configStat.isFile() === false) {
    return undefined;
  }

  let content = <string>await fse.readFile(configPath, 'utf8');

  let file: BmlFile = {
    name: MPROVE_CONFIG_FILENAME,
    path: MPROVE_CONFIG_FILENAME,
    content: content
  };

  return file;
}
