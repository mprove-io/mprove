import { Result } from '@praha/byethrow';
import type { OrgTab } from '#backend/drizzle/postgres/schema/_tabs';
import type { OrgEnt } from '#backend/drizzle/postgres/schema/orgs';
import { getTabProps } from '#backend/functions/get-tab-props/get-tab-props';
import type { TabService } from '#backend/services/tab/tab.service';
import type { OrgEntToTabError } from '#common/types/backend/function-errors/org-ent-to-tab-error';
import type { OrgLt } from '#common/types/shared/st-lt/orgs/org-lt';
import type { OrgSt } from '#common/types/shared/st-lt/orgs/org-st';

export function orgEntToTab(item: {
  ent: OrgEnt;
  tabService: TabService;
}): Result.Result<OrgTab, OrgEntToTabError> {
  return Result.pipe(
    Result.succeed(item),
    Result.bind('tabProps', v =>
      getTabProps<OrgSt, OrgLt>({
        ent: v.ent,
        tabService: v.tabService
      })
    ),
    Result.map((v): OrgTab => ({ ...v.ent, ...v.tabProps.props }))
  );
}
