import * as fse from 'fs-extra';
import { load } from 'js-yaml';
import { common } from '~blockml/barrels/common';

export async function getMproveDirBlockml(item: {
  dir: string;
  configPath: string;
}) {
  let isConfigPathExist = await fse.pathExists(item.configPath);
  if (isConfigPathExist === false) {
    return undefined;
  }

  let configStat = await fse.stat(item.configPath);
  if (configStat.isFile() === false) {
    return undefined;
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
    return undefined;
  } else {
    if (common.isUndefined(parsedYaml.mprove_dir)) {
      return undefined;
    }

    if (
      [
        common.MPROVE_CONFIG_DIR_DOT,
        common.MPROVE_CONFIG_DIR_DOT_SLASH,
        common.MPROVE_CONFIG_DIR_SLASH
      ].indexOf(parsedYaml.mprove_dir) > -1
    ) {
      return item.dir;
    }

    let mdir = parsedYaml.mprove_dir;

    if (mdir.length > 0 && mdir.substring(0, 1) === '.') {
      mdir = mdir.substring(1);
    }

    if (mdir.length > 0 && mdir.substring(0, 1) === '/') {
      mdir = mdir.substring(1);
    }

    let mproveDir = item.dir + '/' + mdir;

    let isDirPathExist = await fse.pathExists(mproveDir);
    if (isDirPathExist === false) {
      return undefined;
    }

    let stat = await fse.stat(mproveDir);
    if (stat.isDirectory() === false) {
      return undefined;
    }

    return mproveDir;
  }
}
