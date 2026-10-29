import { Result } from '@praha/byethrow';
import type {
  BranchEnt,
  BranchTab
} from '#backend/drizzle/postgres/tables/branches';
import { getTabProps } from '#backend/functions/get-tab-props/get-tab-props';
import type { TabService } from '#backend/services/tab/tab.service';
import type { BranchEntToTabError } from '#common/types/backend/function-errors/branch-ent-to-tab-error';
import type { BranchLt } from '#common/types/shared/st-lt/branches/branch-lt';
import type { BranchSt } from '#common/types/shared/st-lt/branches/branch-st';

export function branchEntToTab(item: {
  ent: BranchEnt;
  tabService: TabService;
}): Result.Result<BranchTab, BranchEntToTabError> {
  return Result.pipe(
    Result.succeed(item),
    Result.bind('tabProps', v =>
      getTabProps<BranchSt, BranchLt>({
        ent: v.ent,
        tabService: v.tabService
      })
    ),
    Result.map((v): BranchTab => ({ ...v.ent, ...v.tabProps.props }))
  );
}
