import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { interfaces } from '~blockml/barrels/interfaces';
import { log } from '~blockml/helper/_index';
import { BmError } from '~blockml/models/bm-error';

let func = common.FuncEnum.LogStruct;

export async function logStruct(
  item: {
    apis: common.FileApi[];
    dashboards: common.FileDashboard[];
    metrics: common.MetricAny[];
    models: common.FileModel[];
    reps: common.FileRep[];
    udfsDict: common.UdfsDict;
    views: common.FileView[];
    vizs: common.FileChart[];
    structId: string;
    errors: BmError[];
    caller: common.CallerEnum;
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

  log(cs, caller, func, structId, common.LogTypeEnum.Errors, item.errors);
  log(cs, caller, func, structId, common.LogTypeEnum.Apis, apis);
  log(cs, caller, func, structId, common.LogTypeEnum.Ds, dashboards);
  log(cs, caller, func, structId, common.LogTypeEnum.Metrics, metrics);
  log(cs, caller, func, structId, common.LogTypeEnum.Models, models);
  log(cs, caller, func, structId, common.LogTypeEnum.Reps, reps);
  log(cs, caller, func, structId, common.LogTypeEnum.UdfsDict, udfsDict);
  log(cs, caller, func, structId, common.LogTypeEnum.Views, views);
  log(cs, caller, func, structId, common.LogTypeEnum.Charts, vizs);
}
