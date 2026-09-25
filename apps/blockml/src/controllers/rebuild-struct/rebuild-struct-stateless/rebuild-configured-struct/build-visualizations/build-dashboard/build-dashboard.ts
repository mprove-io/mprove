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
  return Result.pipe(
    Result.succeed(item),
    Result.bind(
      'accessCheckedDashboards',
      (v): Result.Result<FileDashboard[], never> =>
        checkDashboardAccess({
          dashboards: v.dashboards,
          structId: v.structId,
          errors: v.errors,
          caller: v.caller,
          cs: v.cs
        })
    ),
    Result.bind(
      'topParametersCheckedDashboards',
      (v): Result.Result<FileDashboard[], never> =>
        checkDashboardTopParameters({
          dashboards: v.accessCheckedDashboards,
          stores: v.stores,
          structId: v.structId,
          errors: v.errors,
          caller: v.caller,
          cs: v.cs
        })
    ),
    Result.bind(
      'filterConditionsCheckedDashboards',
      (v): Result.Result<FileDashboard[], never> =>
        checkDashboardFilterConditions({
          dashboards: v.topParametersCheckedDashboards,
          structId: v.structId,
          caseSensitiveStringFilters: v.caseSensitiveStringFilters,
          errors: v.errors,
          caller: v.caller,
          cs: v.cs
        })
    ),
    Result.bind(
      'tilesCheckedDashboards',
      (v): Result.Result<FileDashboard[], never> =>
        checkDashboardTilesExist({
          dashboards: v.filterConditionsCheckedDashboards,
          structId: v.structId,
          errors: v.errors,
          caller: v.caller,
          cs: v.cs
        })
    ),
    Result.andThen(
      (v): Result.Result<FileDashboard[], never> =>
        makeDashboardAccessRolesCombined({
          dashboards: v.tilesCheckedDashboards,
          spaces: v.spaces,
          structId: v.structId,
          errors: v.errors,
          caller: v.caller,
          cs: v.cs
        })
    )
  );
}
