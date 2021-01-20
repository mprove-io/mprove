import { enums } from '../../barrels/enums';
import { api } from '../../barrels/api';
import { BmError } from '../../models/bm-error';
import { interfaces } from '../../barrels/interfaces';
import { barDashboard } from '../../barrels/bar-dashboard';
import { ConfigService } from '@nestjs/config';

export function buildDashboard(
  item: {
    dashboards: interfaces.Dashboard[];
    errors: BmError[];
    structId: string;
    caller: enums.CallerEnum;
  },
  cs: ConfigService
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
