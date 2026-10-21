import { Result } from '@praha/byethrow';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import type { UserEnt } from '#backend/drizzle/postgres/schema/users';
import { getTabProps } from '#backend/functions/get-tab-props/get-tab-props';
import type { TabService } from '#backend/services/tab/tab.service';
import type { UserEntToTabError } from '#common/types/backend/function-errors/user-ent-to-tab-error';
import type { UserLt } from '#common/types/shared/st-lt/users/user-lt';
import type { UserSt } from '#common/types/shared/st-lt/users/user-st';

export function userEntToTab(item: {
  ent: UserEnt;
  tabService: TabService;
}): Result.Result<UserTab, UserEntToTabError> {
  return Result.pipe(
    Result.succeed(item),
    Result.bind('tabProps', v =>
      getTabProps<UserSt, UserLt>({
        ent: v.ent,
        tabService: v.tabService
      })
    ),
    Result.map((v): UserTab => ({ ...v.ent, ...v.tabProps.props }))
  );
}
