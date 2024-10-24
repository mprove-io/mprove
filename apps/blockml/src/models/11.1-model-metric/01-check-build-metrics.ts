import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { constants } from '~blockml/barrels/constants';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

let func = common.FuncEnum.CheckBuildMetrics;

export function checkBuildMetrics(
  item: {
    models: common.FileModel[];
    errors: BmError[];
    structId: string;
    caller: common.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Input, item);

  let newModels: common.FileModel[] = [];

  item.models.forEach(x => {
    let errorsOnStart = item.errors.length;

    if (common.isDefined(x.build_metrics)) {
      x.build_metrics.forEach(bm =>
        Object.keys(bm)
          .filter(k => !k.match(common.MyRegex.ENDS_WITH_LINE_NUM()))
          .forEach(parameter => {
            if ([common.ParameterEnum.Time.toString()].indexOf(parameter) < 0) {
              item.errors.push(
                new BmError({
                  title: common.ErTitleEnum.BUILD_METRICS_UNKNOWN_PARAMETER,
                  message:
                    `parameter "${parameter}" can not be used ` +
                    `with "${common.ParameterEnum.BuildMetrics}"`,
                  lines: [
                    {
                      line: (bm as any)[
                        parameter + constants.LINE_NUM
                      ] as number,
                      name: x.fileName,
                      path: x.filePath
                    }
                  ]
                })
              );
              return;
            }
          })
      );
    }

    if (errorsOnStart === item.errors.length) {
      newModels.push(x);
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
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Models, newModels);

  return newModels;
}
