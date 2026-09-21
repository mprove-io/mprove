import { Result } from '@praha/byethrow';
import fse from 'fs-extra';
import { load } from 'js-yaml';
import { MyRegex } from '#common/classes/my-regex';
import { MPROVE_CONFIG_DIR_DOT_SLASH } from '#common/constants/top';
import { isUndefined } from '#common/functions/is-undefined';
import type { GetMproveDirError } from '#common/zod/node-common/function-errors/get-mprove-dir-error';
import { readFileCheckSize } from './read-file-check-size';

export async function getMproveDir(item: {
  dir: string;
  configPath: string;
}): Result.ResultAsync<string | undefined, GetMproveDirError> {
  let isConfigPathExist: boolean = await fse.pathExists(item.configPath);

  if (isConfigPathExist === false) {
    return Result.succeed(undefined);
  }

  let configStat: fse.Stats = await fse.stat(item.configPath);

  if (configStat.isFile() === false) {
    return Result.succeed(undefined);
  }

  return Result.pipe(
    Result.succeed(item),
    Result.bind('configFile', v =>
      readFileCheckSize({
        filePath: v.configPath,
        getStat: false
      })
    ),
    Result.andThen(async v => {
      let parsedYaml: any;
      let breakOnYamlParsing: boolean;

      try {
        parsedYaml = load(v.configFile.content);
      } catch (e) {
        breakOnYamlParsing = true;
      }

      if (
        breakOnYamlParsing === true ||
        isUndefined(parsedYaml) ||
        parsedYaml.constructor !== Object
      ) {
        return Result.succeed(undefined);
      }

      if (isUndefined(parsedYaml.mprove_dir)) {
        return Result.succeed(undefined);
      }

      if (parsedYaml.mprove_dir === MPROVE_CONFIG_DIR_DOT_SLASH) {
        return Result.succeed(item.dir);
      }

      let mdir: string = parsedYaml.mprove_dir;

      if (
        mdir.length > 2 &&
        mdir.substring(0, 2) === MPROVE_CONFIG_DIR_DOT_SLASH
      ) {
        mdir = mdir.substring(2);
      }

      if (mdir.match(MyRegex.CONTAINS_DOT())) {
        return Result.succeed(undefined);
      }

      let mproveDir: string = item.dir + '/' + mdir;

      let isDirPathExist: boolean = await fse.pathExists(mproveDir);

      if (isDirPathExist === false) {
        return Result.succeed(undefined);
      }

      let stat: fse.Stats = await fse.stat(mproveDir);

      if (stat.isDirectory() === false) {
        return Result.succeed(undefined);
      }

      return Result.succeed(mproveDir);
    })
  );
}
