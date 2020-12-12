import { enums } from '../../barrels/enums';
import { api } from '../../barrels/api';
import { BmError } from '../../models/bm-error';
import { interfaces } from '../../barrels/interfaces';
import { barDashboard } from '../../barrels/bar-dashboard';

export function buildDashboard(item: {
  dashboards: interfaces.Dashboard[];
  errors: BmError[];
  structId: string;
  caller: enums.CallerEnum;
}) {
  let dashboards = item.dashboards;

  dashboards = barDashboard.checkDashboardAccessUsers({
    dashboards: dashboards,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  dashboards = barDashboard.checkDashboardFilterDefaults({
    dashboards: dashboards,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  dashboards = barDashboard.checkDashboardReportsExist({
    dashboards: dashboards,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  return dashboards;
}
