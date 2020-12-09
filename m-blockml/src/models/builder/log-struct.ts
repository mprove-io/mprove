import { log } from '../../helper/_index';
import { enums } from '../../barrels/enums';
import { interfaces } from '../../barrels/interfaces';
import { BmError } from '../bm-error';

let func = enums.FuncEnum.LogStruct;

export async function logStruct(item: {
  udfs: interfaces.Udf[];
  views: interfaces.View[];
  models: interfaces.Model[];
  dashboards: interfaces.Dashboard[];
  vizs: interfaces.Viz[];
  structId: string;
  errors: BmError[];
  caller: enums.CallerEnum;
}) {
  let { udfs, views, models, dashboards, vizs, structId, caller } = item;

  log(caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  log(caller, func, structId, enums.LogTypeEnum.Udfs, udfs);
  log(caller, func, structId, enums.LogTypeEnum.Views, views);
  log(caller, func, structId, enums.LogTypeEnum.Models, models);
  log(caller, func, structId, enums.LogTypeEnum.Ds, dashboards);
  log(caller, func, structId, enums.LogTypeEnum.Vizs, vizs);
}
