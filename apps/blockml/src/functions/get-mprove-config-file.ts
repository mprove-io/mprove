import * as fse from 'fs-extra';
import { common } from '~blockml/barrels/common';

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

  let file: common.BmlFile = {
    name: common.MPROVE_CONFIG_FILENAME,
    path: common.MPROVE_CONFIG_FILENAME,
    content: content
  };

  return file;
}
