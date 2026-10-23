import { Result } from '@praha/byethrow';
import type { AvatarTab } from '#backend/drizzle/postgres/schema/_tabs';
import type { AvatarEnt } from '#backend/drizzle/postgres/schema/avatars';
import { getTabProps } from '#backend/functions/get-tab-props/get-tab-props';
import type { TabService } from '#backend/services/tab/tab.service';
import type { AvatarEntToTabError } from '#common/types/backend/function-errors/avatar-ent-to-tab-error';
import type { AvatarLt } from '#common/types/shared/st-lt/avatars/avatar-lt';
import type { AvatarSt } from '#common/types/shared/st-lt/avatars/avatar-st';

export function avatarEntToTab(item: {
  ent: AvatarEnt;
  tabService: TabService;
}): Result.Result<AvatarTab, AvatarEntToTabError> {
  return Result.pipe(
    Result.succeed(item),
    Result.bind('tabProps', v =>
      getTabProps<AvatarSt, AvatarLt>({
        ent: v.ent,
        tabService: v.tabService
      })
    ),
    Result.map((v): AvatarTab => ({ ...v.ent, ...v.tabProps.props }))
  );
}
