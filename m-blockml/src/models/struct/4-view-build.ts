import { enums } from '../../barrels/enums';
import { api } from '../../barrels/api';
import { BmError } from '../../models/bm-error';
import { interfaces } from 'src/barrels/interfaces';
import { barView } from '../../barrels/bar-view';

export function viewBuild(item: {
  views: interfaces.View[];
  udfs: interfaces.Udf[];
  weekStart: api.ProjectWeekStartEnum;
  errors: BmError[];
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

  // views = barView.checkViewDeps({ views: views });

  // views = barView.pickUdfsAndMakePdtViewDeps({ views: views });

  // views = await barView.processViewRefs({
  //   views: views,
  //   udfs_dict: udfsDict,
  //   timezone: 'UTC',
  //   weekStart: item.weekStart,
  //   connection: item.connection,
  //   bqProject: item.bqProject,
  //   projectId: item.projectId,
  //   structId: item.structId
  // });

  // views = barView.swapDerivedTables({ views: views });

  return views;
}
