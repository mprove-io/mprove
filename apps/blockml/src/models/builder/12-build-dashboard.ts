import { ConfigService } from '@nestjs/config';
import { barDashboard } from '~blockml/barrels/bar-dashboard';
import { enums } from '~blockml/barrels/enums';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

export function buildDashboard(
  item: {
    dashboards: interfaces.Dashboard[];
    errors: BmError[];
    structId: string;
    caller: enums.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
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

  dashboards = barDashboard.checkDashboardFilterDefaults(
    {
      dashboards: dashboards,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  dashboards = barDashboard.checkDashboardReportsExist(
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
