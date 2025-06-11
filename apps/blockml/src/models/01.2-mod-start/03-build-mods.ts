import { PostgresConnection } from '@malloydata/db-postgres';
import { Model as MalloyModel, Runtime } from '@malloydata/malloy';
import { ConfigService } from '@nestjs/config';
import * as fse from 'fs-extra';
import { forEachSeries } from 'p-iteration';
import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { nodeCommon } from '~blockml/barrels/node-common';
import { BmError } from '~blockml/models/bm-error';
import { WrapResult } from '~node-common/interfaces/wrap-result';

let func = common.FuncEnum.BuildMods;

export async function buildMods(
  item: {
    mods: common.FileMod[];
    malloyConnections: PostgresConnection[];
    tempDir: string;
    projectId: string;
    errors: BmError[];
    structId: string;
    caller: common.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let { caller, structId, projectId } = item;
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Input, item);

  let newMods: common.FileMod[] = [];

  let runtime = new Runtime({
    urlReader: {
      readURL: async (url: URL) => await fse.readFile(url, 'utf8')
    },
    connections: {
      lookupConnection: async function (name: string) {
        return item.malloyConnections.find(mc => mc.name === name);
      }
    }
  });

  let promises: Promise<WrapResult<MalloyModel>>[] = [];

  await forEachSeries(item.mods, async x => {
    let modelPath = x.location;

    let fullModelPath = common.isDefined(projectId)
      ? `${item.tempDir}/${projectId}/${modelPath}`
      : `${item.tempDir}/${modelPath}`;

    let modelUrl = new URL('file://' + fullModelPath);

    promises.push(
      nodeCommon
        .getWrapResult<MalloyModel>({
          promise: runtime.getModel(modelUrl)
        })
        .catch(e => nodeCommon.errorToWrapResult<MalloyModel>(e))
    );
  });

  let wrapResults: WrapResult<MalloyModel>[] = await Promise.all(promises);

  // console.log('wrapResults');
  // console.dir(wrapResults, { depth: 4 });

  await forEachSeries(item.mods, async (x, index) => {
    let errorsOnStart = item.errors.length;

    let wrapResult = wrapResults[index];

    if (common.isDefined(wrapResult.error)) {
      item.errors.push(
        new BmError({
          title: common.ErTitleEnum.MOD_COMPILATION_FAILED,
          message: undefined, // no leak
          lines: [
            {
              line: x.location_line_num,
              name: x.fileName,
              path: x.filePath
            }
          ]
        })
      );
      return;
    }

    x.malloyModel = wrapResult.data;

    if (errorsOnStart === item.errors.length) {
      newMods.push(x);
    }
  });

  // console.log('item.errors');
  // console.log(item.errors);

  helper.log(
    cs,
    caller,
    func,
    structId,
    common.LogTypeEnum.Errors,
    item.errors
  );
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Mods, newMods);

  return newMods;
}
