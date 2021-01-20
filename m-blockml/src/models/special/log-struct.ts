import { log } from '../../helper/_index';
import { enums } from '../../barrels/enums';
import { interfaces } from '../../barrels/interfaces';
import { BmError } from '../bm-error';
import { api } from '../../barrels/api';
import { ConfigService } from '@nestjs/config';

let func = enums.FuncEnum.LogStruct;

export async function logStruct(
  item: {
    udfsDict: api.UdfsDict;
    views: interfaces.View[];
    models: interfaces.Model[];
    dashboards: interfaces.Dashboard[];
    vizs: interfaces.Viz[];
    structId: string;
    errors: BmError[];
    caller: enums.CallerEnum;
  },
  cs: ConfigService
) {
  let { udfsDict, views, models, dashboards, vizs, structId, caller } = item;

  log(cs, caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  log(cs, caller, func, structId, enums.LogTypeEnum.UdfsDict, udfsDict);
  log(cs, caller, func, structId, enums.LogTypeEnum.Views, views);
  log(cs, caller, func, structId, enums.LogTypeEnum.Models, models);
  log(cs, caller, func, structId, enums.LogTypeEnum.Ds, dashboards);
  log(cs, caller, func, structId, enums.LogTypeEnum.Vizs, vizs);
}
