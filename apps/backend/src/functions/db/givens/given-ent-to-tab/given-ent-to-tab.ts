import { Result } from '@praha/byethrow';
import type { GivenTab } from '#backend/drizzle/postgres/schema/_tabs';
import type { GivenEnt } from '#backend/drizzle/postgres/schema/givens';
import { getTabProps } from '#backend/functions/get-tab-props/get-tab-props';
import type { TabService } from '#backend/services/tab/tab.service';
import type { GivenEntToTabError } from '#common/types/backend/function-errors/given-ent-to-tab-error';
import type { GivenLt } from '#common/types/shared/st-lt/givens/given-lt';
import type { GivenSt } from '#common/types/shared/st-lt/givens/given-st';

export function givenEntToTab(item: {
  ent: GivenEnt;
  tabService: TabService;
}): Result.Result<GivenTab, GivenEntToTabError> {
  return Result.pipe(
    Result.succeed(item),
    Result.bind('tabProps', v =>
      getTabProps<GivenSt, GivenLt>({
        ent: v.ent,
        tabService: v.tabService
      })
    ),
    Result.map((v): GivenTab => ({ ...v.ent, ...v.tabProps.props }))
  );
}
