import { enums } from '../../barrels/enums';
import { api } from '../../barrels/api';
import { BmError } from '../../models/bm-error';
import { interfaces } from '../../barrels/interfaces';
import { constants } from '../../barrels/constants';
import { barView } from '../../barrels/bar-view';

export function viewBuild(item: {
  views: interfaces.View[];
  udfs: interfaces.Udf[];
  udfsDict: interfaces.UdfsDict;
  weekStart: api.ProjectWeekStartEnum;
  errors: BmError[];
  projectId: string;
  structId: string;
  caller: enums.CallerEnum;
}) {
  let views = item.views;

  views = barView.checkTable({
    views: views,
    errors: item.errors,
    structId: item.structId,
    caller: item.caller
  });

  views = barView.checkViewUdfs({
    views: views,
    udfs: item.udfs,
    errors: item.errors,
    structId: item.structId,
    caller: item.caller
  });

  views = barView.checkViewFilterDefaults({
    views: views,
    weekStart: item.weekStart,
    errors: item.errors,
    structId: item.structId,
    caller: item.caller
  });

  views = barView.checkDerivedTableApplyFilter({
    views: views,
    errors: item.errors,
    structId: item.structId,
    caller: item.caller
  });

  views = barView.makeViewAsDeps({
    views: views,
    errors: item.errors,
    structId: item.structId,
    caller: item.caller
  });

  views = barView.checkViewCycles({
    views: views,
    errors: item.errors,
    structId: item.structId,
    caller: item.caller
  });

  views = barView.checkViewAsDeps({
    views: views,
    errors: item.errors,
    structId: item.structId,
    caller: item.caller
  });

  views = barView.pickUdfsFromAsDeps({
    views: views,
    structId: item.structId,
    caller: item.caller
  });

  views = barView.processViewRefs({
    views: views,
    udfsDict: item.udfsDict,
    timezone: constants.UTC,
    weekStart: item.weekStart,
    projectId: item.projectId,
    structId: item.structId,
    caller: item.caller
  });

  return views;
}
