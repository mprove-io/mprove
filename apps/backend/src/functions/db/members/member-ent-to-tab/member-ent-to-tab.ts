import { Result } from '@praha/byethrow';
import type { MemberTab } from '#backend/drizzle/postgres/schema/_tabs';
import type { MemberEnt } from '#backend/drizzle/postgres/schema/members';
import { getTabProps } from '#backend/functions/get-tab-props/get-tab-props';
import type { TabService } from '#backend/services/tab/tab.service';
import type { MemberEntToTabError } from '#common/types/backend/function-errors/member-ent-to-tab-error';
import type { MemberLt } from '#common/types/shared/st-lt/members/member-lt';
import type { MemberSt } from '#common/types/shared/st-lt/members/member-st';

export function memberEntToTab(item: {
  ent: MemberEnt;
  tabService: TabService;
}): Result.Result<MemberTab, MemberEntToTabError> {
  return Result.pipe(
    Result.succeed(item),
    Result.bind('tabProps', v =>
      getTabProps<MemberSt, MemberLt>({
        ent: v.ent,
        tabService: v.tabService
      })
    ),
    Result.map((v): MemberTab => ({ ...v.ent, ...v.tabProps.props }))
  );
}
