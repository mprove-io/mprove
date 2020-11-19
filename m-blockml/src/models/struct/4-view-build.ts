import { enums } from '../../barrels/enums';
import { BmError } from '../../models/bm-error';
import { interfaces } from 'src/barrels/interfaces';
import { barView } from '../../barrels/bar-view';

export function viewBuild(item: {
  views: interfaces.View[];
  udfs: interfaces.Udf[];
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

  // // ApFilter
  // views = barFilter.checkVMDFilterDefaults({
  //   entities: views,
  //   weekStart: item.weekStart,
  //   connection: item.connection
  // });

  // // ApView
  // views = barView.checkDerivedTableApplyFilter({ views: views });

  // // process view references

  // views = barView.makeViewAsDeps({ views: views });
  // views = barView.checkViewCycles({ views: views });
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
