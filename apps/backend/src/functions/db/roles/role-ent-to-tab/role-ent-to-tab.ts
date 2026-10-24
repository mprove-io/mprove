import { Result } from '@praha/byethrow';
import type { RoleTab } from '#backend/drizzle/postgres/schema/_tabs';
import type { RoleEnt } from '#backend/drizzle/postgres/schema/roles';
import { getTabProps } from '#backend/functions/get-tab-props/get-tab-props';
import type { TabService } from '#backend/services/tab/tab.service';
import type { RoleEntToTabError } from '#common/types/backend/function-errors/role-ent-to-tab-error';
import type { RoleLt } from '#common/types/shared/st-lt/roles/role-lt';
import type { RoleSt } from '#common/types/shared/st-lt/roles/role-st';

export function roleEntToTab(item: {
  ent: RoleEnt;
  tabService: TabService;
}): Result.Result<RoleTab, RoleEntToTabError> {
  return Result.pipe(
    Result.succeed(item),
    Result.bind('tabProps', v =>
      getTabProps<RoleSt, RoleLt>({
        ent: v.ent,
        tabService: v.tabService
      })
    ),
    Result.map((v): RoleTab => ({ ...v.ent, ...v.tabProps.props }))
  );
}
