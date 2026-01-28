import { ConfigService } from '@nestjs/config';
import { CallerEnum } from '#common/enums/special/caller.enum';
import { FileDashboard } from '#common/interfaces/blockml/internal/file-dashboard';
import { FileStore } from '#common/interfaces/blockml/internal/file-store';
import { BlockmlConfig } from '~blockml/config/blockml-config';
import { BmError } from '~blockml/models/bm-error';
import { checkDashboardAccess } from './check-dashboard-access';
import { checkDashboardFilterConditions } from './check-dashboard-filter-conditions';
import { checkDashboardTilesExist } from './check-dashboard-tiles-exist';
import { checkDashboardTopParameters } from './check-dashboard-top-parameters';

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

  dashboards = checkDashboardAccess(
    {
      dashboards: dashboards,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  dashboards = checkDashboardTopParameters(
    {
      dashboards: dashboards,
      stores: item.stores,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  dashboards = checkDashboardFilterConditions(
    {
      dashboards: dashboards,
      structId: item.structId,
      caseSensitiveStringFilters: item.caseSensitiveStringFilters,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  dashboards = checkDashboardTilesExist(
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
