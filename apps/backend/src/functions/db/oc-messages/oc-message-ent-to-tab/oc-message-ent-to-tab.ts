import { Result } from '@praha/byethrow';
import type { OcMessageTab } from '#backend/drizzle/postgres/schema/_tabs';
import type { OcMessageEnt } from '#backend/drizzle/postgres/schema/oc-messages';
import { getTabProps } from '#backend/functions/get-tab-props/get-tab-props';
import type { TabService } from '#backend/services/tab/tab.service';
import type { OcMessageEntToTabError } from '#common/types/backend/function-errors/oc-message-ent-to-tab-error';
import type { OcMessageLt } from '#common/types/shared/st-lt/oc-messages/oc-message-lt';
import type { OcMessageSt } from '#common/types/shared/st-lt/oc-messages/oc-message-st';

export function ocMessageEntToTab(item: {
  ent: OcMessageEnt;
  tabService: TabService;
}): Result.Result<OcMessageTab, OcMessageEntToTabError> {
  return Result.pipe(
    Result.succeed(item),
    Result.bind('tabProps', v =>
      getTabProps<OcMessageSt, OcMessageLt>({
        ent: v.ent,
        tabService: v.tabService
      })
    ),
    Result.map((v): OcMessageTab => ({ ...v.ent, ...v.tabProps.props }))
  );
}
