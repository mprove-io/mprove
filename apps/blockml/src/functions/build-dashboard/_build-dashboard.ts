import { ConfigService } from '@nestjs/config';
import { barDashboard } from '~blockml/barrels/bar-dashboard';
import { BmError } from '~blockml/models/bm-error';

export function buildDashboard(
  item: {
    dashboards: FileDashboard[];
    stores: FileStore[];
    errors: BmError[];
    structId: string;
    caseSensitiveStringFilters: boolean;
    caller: CallerEnum;
  },
  cs: ConfigService<BlockmlConfig>
) {
  let dashboards = item.dashboards;

  dashboards = barDashboard.checkDashboardAccess(
    {
      dashboards: dashboards,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  dashboards = barDashboard.checkDashboardTopParameters(
    {
      dashboards: dashboards,
      stores: item.stores,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  dashboards = barDashboard.checkDashboardFilterConditions(
    {
      dashboards: dashboards,
      structId: item.structId,
      caseSensitiveStringFilters: item.caseSensitiveStringFilters,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  dashboards = barDashboard.checkDashboardTilesExist(
    {
      dashboards: dashboards,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  return dashboards;
}
