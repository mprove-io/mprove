import { ConfigService } from '@nestjs/config';
import { barView } from '~blockml/barrels/bar-view';
import { common } from '~blockml/barrels/common';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

export function buildView(
  item: {
    views: common.FileView[];
    udfs: common.FileUdf[];
    udfsDict: common.UdfsDict;
    weekStart: common.ProjectWeekStartEnum;
    errors: BmError[];
    structId: string;
    caseSensitiveStringFilters: boolean;
    envId: string;
    evs: common.Ev[];
    caller: common.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
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

  views = barView.checkTableEnvRefs(
    {
      views: views,
      structId: item.structId,
      envId: item.envId,
      evs: item.evs,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  views = barView.checkDerivedTableEnvRefs(
    {
      views: views,
      structId: item.structId,
      envId: item.envId,
      evs: item.evs,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  views = barView.checkViewAccess(
    {
      views: views,
      structId: item.structId,
      envId: item.envId,
      evs: item.evs,
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
      caseSensitiveStringFilters: item.caseSensitiveStringFilters,
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

  views = barView.checkViewBuildMetrics(
    {
      views: views,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  return views;
}
