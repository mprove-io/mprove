import * as fse from 'fs-extra';
import { load } from 'js-yaml';
import { common } from '~disk/barrels/common';

export async function getFilesDirDisk(item: {
  dir: string;
  configPath: string;
}) {
  let isConfigPathExist = await fse.pathExists(item.configPath);
  if (isConfigPathExist === false) {
    return item.dir;
  }

  let configStat = await fse.stat(item.configPath);
  if (configStat.isFile() === false) {
    return item.dir;
  }

  let content = <string>await fse.readFile(item.configPath, 'utf8');
  let parsedYaml: any;
  let breakOnYamlParsing: boolean;

  try {
    parsedYaml = load(content);
  } catch (e) {
    breakOnYamlParsing = true;
  }

  if (
    breakOnYamlParsing === true ||
    common.isUndefined(parsedYaml) ||
    parsedYaml.constructor !== Object
  ) {
    return item.dir;
  } else {
    if (common.isUndefined(parsedYaml.filesDir)) {
      return item.dir;
    }

    if (
      [
        common.MPROVE_CONFIG_FILES_DIR_ROOT,
        common.MPROVE_CONFIG_FILES_DIR_ROOT_SLASH
      ].indexOf(parsedYaml.filesDir) > -1
    ) {
      return item.dir;
    }

    let mproveDir = item.dir + '/' + parsedYaml.files_dir;

    let isDirPathExist = await fse.pathExists(mproveDir);
    if (isDirPathExist === false) {
      return item.dir;
    }

    let stat = await fse.stat(mproveDir);
    if (stat.isDirectory() === false) {
      return item.dir;
    }

    return mproveDir;
  }
}
