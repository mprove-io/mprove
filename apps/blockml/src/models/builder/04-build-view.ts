import { ConfigService } from '@nestjs/config';
import { api } from '~blockml/barrels/api';
import { barView } from '~blockml/barrels/bar-view';
import { enums } from '~blockml/barrels/enums';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

export function buildView(
  item: {
    views: interfaces.View[];
    udfs: interfaces.Udf[];
    udfsDict: api.UdfsDict;
    weekStart: api.ProjectWeekStartEnum;
    errors: BmError[];
    structId: string;
    caller: enums.CallerEnum;
  },
  cs: ConfigService
) {
  let views = item.views;

  views = barView.checkTable(
    {
      views: views,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  views = barView.checkViewUdfs(
    {
      views: views,
      udfs: item.udfs,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  views = barView.checkViewFilterDefaults(
    {
      views: views,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  views = barView.checkDerivedTableApplyFilter(
    {
      views: views,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  views = barView.makeViewAsDeps(
    {
      views: views,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  views = barView.checkViewCycles(
    {
      views: views,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  views = barView.checkViewAsDeps(
    {
      views: views,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  views = barView.pickUdfsFromAsDeps(
    {
      views: views,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  views = barView.processViewRefs(
    {
      views: views,
      udfsDict: item.udfsDict,
      weekStart: item.weekStart,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  return views;
}
