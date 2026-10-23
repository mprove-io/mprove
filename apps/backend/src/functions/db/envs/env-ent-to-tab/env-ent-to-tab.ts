import { Result } from '@praha/byethrow';
import type { EnvTab } from '#backend/drizzle/postgres/schema/_tabs';
import type { EnvEnt } from '#backend/drizzle/postgres/schema/envs';
import { getTabProps } from '#backend/functions/get-tab-props/get-tab-props';
import type { TabService } from '#backend/services/tab/tab.service';
import type { EnvEntToTabError } from '#common/types/backend/function-errors/env-ent-to-tab-error';
import type { EnvLt } from '#common/types/shared/st-lt/envs/env-lt';
import type { EnvSt } from '#common/types/shared/st-lt/envs/env-st';

export function envEntToTab(item: {
  ent: EnvEnt;
  tabService: TabService;
}): Result.Result<EnvTab, EnvEntToTabError> {
  return Result.pipe(
    Result.succeed(item),
    Result.bind('tabProps', v =>
      getTabProps<EnvSt, EnvLt>({
        ent: v.ent,
        tabService: v.tabService
      })
    ),
    Result.map((v): EnvTab => ({ ...v.ent, ...v.tabProps.props }))
  );
}
