import { Result } from '@praha/byethrow';
import type {
  StructEnt,
  StructTab
} from '#backend/drizzle/postgres/tables/structs';
import { getTabProps } from '#backend/functions/get-tab-props/get-tab-props';
import type { TabService } from '#backend/services/tab/tab.service';
import type { StructEntToTabError } from '#common/types/backend/function-errors/struct-ent-to-tab-error';
import type { StructLt } from '#common/types/shared/st-lt/structs/struct-lt';
import type { StructSt } from '#common/types/shared/st-lt/structs/struct-st';

export function structEntToTab(item: {
  ent: StructEnt;
  tabService: TabService;
}): Result.Result<StructTab, StructEntToTabError> {
  return Result.pipe(
    Result.succeed(item),
    Result.bind('tabProps', v =>
      getTabProps<StructSt, StructLt>({
        ent: v.ent,
        tabService: v.tabService
      })
    ),
    Result.map((v): StructTab => ({ ...v.ent, ...v.tabProps.props }))
  );
}
