import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { enums } from '~blockml/barrels/enums';
import { interfaces } from '~blockml/barrels/interfaces';
import { log } from '~blockml/helper/_index';
import { BmError } from '~blockml/models/bm-error';

let func = enums.FuncEnum.LogStruct;

export async function logStruct(
  item: {
    apis: interfaces.Api[];
    dashboards: interfaces.Dashboard[];
    metrics: common.MetricAny[];
    models: interfaces.Model[];
    reps: interfaces.Rep[];
    udfsDict: common.UdfsDict;
    views: interfaces.View[];
    vizs: interfaces.Viz[];
    structId: string;
    errors: BmError[];
    caller: enums.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let {
    udfsDict,
    views,
    models,
    reps,
    metrics,
    apis,
    dashboards,
    vizs,
    structId,
    caller
  } = item;

  log(cs, caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  log(cs, caller, func, structId, enums.LogTypeEnum.Apis, apis);
  log(cs, caller, func, structId, enums.LogTypeEnum.Ds, dashboards);
  log(cs, caller, func, structId, enums.LogTypeEnum.Metrics, metrics);
  log(cs, caller, func, structId, enums.LogTypeEnum.Models, models);
  log(cs, caller, func, structId, enums.LogTypeEnum.Reps, reps);
  log(cs, caller, func, structId, enums.LogTypeEnum.UdfsDict, udfsDict);
  log(cs, caller, func, structId, enums.LogTypeEnum.Views, views);
  log(cs, caller, func, structId, enums.LogTypeEnum.Vizs, vizs);
}
