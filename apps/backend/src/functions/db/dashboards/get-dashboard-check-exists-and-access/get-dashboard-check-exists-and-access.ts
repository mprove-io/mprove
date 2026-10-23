import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import type {
  DashboardTab,
  MemberTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { dashboardsTable } from '#backend/drizzle/postgres/schema/dashboards';
import { checkAccess } from '#backend/functions/check-access/check-access';
import type { DbService } from '#backend/services/db/db.service';
import type { GetDashboardCheckExistsAndAccessError } from '#common/types/backend/function-errors/get-dashboard-check-exists-and-access-error';
import type { Member } from '#common/types/backend/parts/member';

export async function getDashboardCheckExistsAndAccess(item: {
  db: DbService;
  dashboardId: string;
  structId: string;
  userMember: MemberTab | Member;
  user: UserTab;
}): Result.ResultAsync<DashboardTab, GetDashboardCheckExistsAndAccessError> {
  return Result.pipe(
    Result.succeed(item),
    Result.bind('dashboard', v =>
      v.db.dashboards.findFirstCheckExists({
        where: and(
          eq(dashboardsTable.structId, v.structId),
          eq(dashboardsTable.dashboardId, v.dashboardId)
        )
      })
    ),
    Result.andThrough(v =>
      v.dashboard.draft === true && v.dashboard.creatorId !== v.user.userId
        ? Result.fail({ code: 'BACKEND_DASHBOARD_CREATOR_ID_MISMATCH' })
        : Result.succeed()
    ),
    Result.andThrough(v =>
      v.dashboard.draft === false &&
      checkAccess({
        member: v.userMember,
        accessRoles: v.dashboard.accessRolesCombined,
        filePath: v.dashboard.filePath
      }) === false
        ? Result.fail({ code: 'BACKEND_FORBIDDEN_DASHBOARD' })
        : Result.succeed()
    ),
    Result.map((v): DashboardTab => v.dashboard)
  );
}
