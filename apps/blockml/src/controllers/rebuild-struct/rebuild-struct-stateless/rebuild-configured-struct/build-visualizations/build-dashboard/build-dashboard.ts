import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { BmError } from '#blockml/classes/bm-error';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import type { CallerEnum } from '#common/enums/special/caller.enum';
import type { FileDashboard } from '#common/zod/blockml/internal/file-dashboard';
import type { FilePartSpace } from '#common/zod/blockml/internal/file-part-space';
import type { FileStore } from '#common/zod/blockml/internal/file-store';
import { checkDashboardAccess } from './check-dashboard-access/check-dashboard-access';
import { checkDashboardFilterConditions } from './check-dashboard-filter-conditions/check-dashboard-filter-conditions';
import { checkDashboardTilesExist } from './check-dashboard-tiles-exist/check-dashboard-tiles-exist';
import { checkDashboardTopParameters } from './check-dashboard-top-parameters/check-dashboard-top-parameters';
import { makeDashboardAccessRolesCombined } from './make-dashboard-access-roles-combined/make-dashboard-access-roles-combined';

export function buildDashboard(item: {
  dashboards: FileDashboard[];
  spaces: FilePartSpace[];
  stores: FileStore[];
  errors: BmError[];
  structId: string;
  caseSensitiveStringFilters: boolean;
  caller: CallerEnum;
  cs: ConfigService<BlockmlConfig>;
}): Result.Result<FileDashboard[], never> {
  let {
    dashboards,
    spaces,
    stores,
    errors,
    structId,
    caseSensitiveStringFilters,
    caller,
    cs
  } = item;

  dashboards = checkDashboardAccess(
    {
      dashboards: dashboards,
      structId: structId,
      errors: errors,
      caller: caller
    },
    cs
  );

  dashboards = checkDashboardTopParameters(
    {
      dashboards: dashboards,
      stores: stores,
      structId: structId,
      errors: errors,
      caller: caller
    },
    cs
  );

  dashboards = checkDashboardFilterConditions(
    {
      dashboards: dashboards,
      structId: structId,
      caseSensitiveStringFilters: caseSensitiveStringFilters,
      errors: errors,
      caller: caller
    },
    cs
  );

  dashboards = checkDashboardTilesExist(
    {
      dashboards: dashboards,
      structId: structId,
      errors: errors,
      caller: caller
    },
    cs
  );

  dashboards = makeDashboardAccessRolesCombined(
    {
      dashboards: dashboards,
      spaces: spaces,
      structId: structId,
      errors: errors,
      caller: caller
    },
    cs
  );

  return Result.succeed(dashboards);
}
