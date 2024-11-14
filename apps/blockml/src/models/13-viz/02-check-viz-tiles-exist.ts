import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

let func = common.FuncEnum.CheckVizTilesExist;

export function checkVizTilesExist(
  item: {
    vizs: common.FileVis[];
    errors: BmError[];
    structId: string;
    caller: common.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Input, item);

  let newVizs: common.FileVis[] = [];

  item.vizs.forEach(x => {
    let errorsOnStart = item.errors.length;

    if (common.isUndefined(x.tiles)) {
      item.errors.push(
        new BmError({
          title: common.ErTitleEnum.CHART_MISSING_TILES,
          message:
            `${common.FileExtensionEnum.Vis} must have ` +
            `"${common.ParameterEnum.Tiles}" parameter`,
          lines: [
            {
              line: x.vis_line_num,
              name: x.fileName,
              path: x.filePath
            }
          ]
        })
      );
      return;
    }

    if (x.tiles.length > 1) {
      item.errors.push(
        new BmError({
          title: common.ErTitleEnum.CHART_TOO_MANY_TILES,
          message: `${common.FileExtensionEnum.Vis} must have exactly one tile`,
          lines: [
            {
              line: x.vis_line_num,
              name: x.fileName,
              path: x.filePath
            }
          ]
        })
      );
      return;
    }

    if (errorsOnStart === item.errors.length) {
      newVizs.push(x);
    }
  });

  helper.log(
    cs,
    caller,
    func,
    structId,
    common.LogTypeEnum.Errors,
    item.errors
  );
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Vizs, newVizs);

  return newVizs;
}
