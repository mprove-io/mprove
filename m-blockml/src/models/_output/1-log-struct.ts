import { enums } from '../../barrels/enums';
import { interfaces } from '../../barrels/interfaces';
import { helper } from '../../barrels/helper';
import { BmError } from '../bm-error';

let logPack = '_output';
let logFolder = '1-log-struct';

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

  helper.log(logId, logPack, logFolder, enums.LogEnum.Errors, item.errors);
  helper.log(logId, logPack, logFolder, enums.LogEnum.Udfs, udfs);
  helper.log(logId, logPack, logFolder, enums.LogEnum.Views, views);
  helper.log(logId, logPack, logFolder, enums.LogEnum.Models, models);
  helper.log(logId, logPack, logFolder, enums.LogEnum.Dashboards, dashboards);
  helper.log(logId, logPack, logFolder, enums.LogEnum.Vis, visualizations);
}
