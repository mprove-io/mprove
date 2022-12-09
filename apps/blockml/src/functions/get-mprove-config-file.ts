import * as fse from 'fs-extra';
import { common } from '~blockml/barrels/common';
import { nodeCommon } from '~blockml/barrels/node-common';

export async function getMproveConfigFile(configPath: string) {
  let isPathExist = await fse.pathExists(configPath);

  if (isPathExist === false) {
    return undefined;
  }

  let configStat = await fse.stat(configPath);
  if (configStat.isFile() === false) {
    return undefined;
  }

  let { content } = await nodeCommon.readFileCheckSize({
    filePath: configPath,
    getStat: false
  });

  let file: common.BmlFile = {
    name: common.MPROVE_CONFIG_FILENAME,
    path: common.MPROVE_CONFIG_FILENAME,
    content: content
  };

  return file;
}
