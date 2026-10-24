import { Result } from '@praha/byethrow';
import type { ProviderTab } from '#backend/drizzle/postgres/schema/_tabs';
import type { ProviderEnt } from '#backend/drizzle/postgres/schema/providers';
import { getTabProps } from '#backend/functions/get-tab-props/get-tab-props';
import type { TabService } from '#backend/services/tab/tab.service';
import type { ProviderEntToTabError } from '#common/types/backend/function-errors/provider-ent-to-tab-error';
import type { ProviderLt } from '#common/types/shared/st-lt/providers/provider-lt';
import type { ProviderSt } from '#common/types/shared/st-lt/providers/provider-st';

export function providerEntToTab(item: {
  ent: ProviderEnt;
  tabService: TabService;
}): Result.Result<ProviderTab, ProviderEntToTabError> {
  return Result.pipe(
    Result.succeed(item),
    Result.bind('tabProps', v =>
      getTabProps<ProviderSt, ProviderLt>({
        ent: v.ent,
        tabService: v.tabService
      })
    ),
    Result.map(
      (v): ProviderTab => ({ ...v.ent, ...v.tabProps.props }) as ProviderTab
    )
  );
}
