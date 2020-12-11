import { enums } from '../../barrels/enums';
import { api } from '../../barrels/api';
import { BmError } from '../../models/bm-error';
import { interfaces } from '../../barrels/interfaces';
import { barView } from '../../barrels/bar-view';

export function buildView(item: {
  views: interfaces.View[];
  udfs: interfaces.Udf[];
  udfsDict: api.UdfsDict;
  weekStart: api.ProjectWeekStartEnum;
  errors: BmError[];
  projectId: string;
  structId: string;
  caller: enums.CallerEnum;
}) {
  let views = item.views;

  views = barView.checkTable({
    views: views,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  views = barView.checkViewUdfs({
    views: views,
    udfs: item.udfs,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  views = barView.checkViewFilterDefaults({
    views: views,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  views = barView.checkDerivedTableApplyFilter({
    views: views,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  views = barView.makeViewAsDeps({
    views: views,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  views = barView.checkViewCycles({
    views: views,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  views = barView.checkViewAsDeps({
    views: views,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  views = barView.pickUdfsFromAsDeps({
    views: views,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  views = barView.processViewRefs({
    views: views,
    udfsDict: item.udfsDict,
    weekStart: item.weekStart,
    projectId: item.projectId,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  return views;
}
