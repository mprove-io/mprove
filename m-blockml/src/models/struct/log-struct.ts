import { log } from '../../helper/_index';
import { enums } from '../../barrels/enums';
import { interfaces } from '../../barrels/interfaces';
import { BmError } from '../bm-error';

let logPack = 'struct';
let logFolder = 'log-struct';

export async function logStruct(item: {
  structId: string;
  errors: BmError[];
  udfs: interfaces.Udf[];
  views: interfaces.View[];
  models: interfaces.Model[];
  dashboards: interfaces.Dashboard[];
  visualizations: interfaces.Visualization[];
}) {
  let logId = item.structId;

  let { udfs, views, models, dashboards, visualizations } = item;

  log(logId, logPack, logFolder, enums.LogEnum.Errors, item.errors);
  log(logId, logPack, logFolder, enums.LogEnum.Udfs, udfs);
  log(logId, logPack, logFolder, enums.LogEnum.Views, views);
  log(logId, logPack, logFolder, enums.LogEnum.Models, models);
  log(logId, logPack, logFolder, enums.LogEnum.Dashboards, dashboards);
  log(logId, logPack, logFolder, enums.LogEnum.Vis, visualizations);
}
