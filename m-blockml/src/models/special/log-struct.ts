import { log } from '../../helper/_index';
import { enums } from '../../barrels/enums';
import { interfaces } from '../../barrels/interfaces';
import { BmError } from '../bm-error';
import { api } from '../../barrels/api';

let func = enums.FuncEnum.LogStruct;

export async function logStruct(item: {
  udfsDict: api.UdfsDict;
  views: interfaces.View[];
  models: interfaces.Model[];
  dashboards: interfaces.Dashboard[];
  vizs: interfaces.Viz[];
  structId: string;
  errors: BmError[];
  caller: enums.CallerEnum;
}) {
  let { udfsDict, views, models, dashboards, vizs, structId, caller } = item;

  log(caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  log(caller, func, structId, enums.LogTypeEnum.UdfsDict, udfsDict);
  log(caller, func, structId, enums.LogTypeEnum.Views, views);
  log(caller, func, structId, enums.LogTypeEnum.Models, models);
  log(caller, func, structId, enums.LogTypeEnum.Ds, dashboards);
  log(caller, func, structId, enums.LogTypeEnum.Vizs, vizs);
}
