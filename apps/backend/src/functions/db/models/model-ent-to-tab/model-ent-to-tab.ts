import { Result } from '@praha/byethrow';
import type {
  ModelEnt,
  ModelTab
} from '#backend/drizzle/postgres/tables/models';
import { getTabProps } from '#backend/functions/get-tab-props/get-tab-props';
import type { TabService } from '#backend/services/tab/tab.service';
import type { ModelEntToTabError } from '#common/types/backend/function-errors/model-ent-to-tab-error';
import type { ModelLt } from '#common/types/shared/st-lt/models/model-lt';
import type { ModelSt } from '#common/types/shared/st-lt/models/model-st';

export function modelEntToTab(item: {
  ent: ModelEnt;
  tabService: TabService;
}): Result.Result<ModelTab, ModelEntToTabError> {
  return Result.pipe(
    Result.succeed(item),
    Result.bind('tabProps', v =>
      getTabProps<ModelSt, ModelLt>({
        ent: v.ent,
        tabService: v.tabService
      })
    ),
    Result.map((v): ModelTab => ({ ...v.ent, ...v.tabProps.props }))
  );
}
