import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { interfaces } from '~blockml/barrels/interfaces';
import { log } from '~blockml/helper/_index';
import { BmError } from '~blockml/models/bm-error';

let func = common.FuncEnum.LogStruct;

export async function logStruct(
  item: {
    views: common.FileView[];
    models: common.FileModel[];
    stores: common.FileStore[];
    reports: common.FileReport[];
    dashboards: common.FileDashboard[];
    charts: common.FileChart[];
    udfsDict: common.UdfsDict;
    metrics: common.ModelMetric[];
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
    reports,
    metrics,
    stores,
    dashboards,
    charts,
    structId,
    caller
  } = item;

  log(cs, caller, func, structId, common.LogTypeEnum.Errors, item.errors);
  log(cs, caller, func, structId, common.LogTypeEnum.Views, views);
  log(cs, caller, func, structId, common.LogTypeEnum.Models, models);
  log(cs, caller, func, structId, common.LogTypeEnum.Stores, stores);
  log(cs, caller, func, structId, common.LogTypeEnum.Reports, reports);
  log(cs, caller, func, structId, common.LogTypeEnum.Ds, dashboards);
  log(cs, caller, func, structId, common.LogTypeEnum.Charts, charts);
  log(cs, caller, func, structId, common.LogTypeEnum.UdfsDict, udfsDict);
  log(cs, caller, func, structId, common.LogTypeEnum.Metrics, metrics);
}
