import { Result } from '@praha/byethrow';
import type { ProjectTab } from '#backend/drizzle/postgres/schema/_tabs';
import type { ProjectEnt } from '#backend/drizzle/postgres/schema/projects';
import { getTabProps } from '#backend/functions/get-tab-props/get-tab-props';
import type { TabService } from '#backend/services/tab/tab.service';
import type { ProjectEntToTabError } from '#common/types/backend/function-errors/project-ent-to-tab-error';
import type { ProjectLt } from '#common/types/shared/st-lt/projects/project-lt';
import type { ProjectSt } from '#common/types/shared/st-lt/projects/project-st';

export function projectEntToTab(item: {
  ent: ProjectEnt;
  tabService: TabService;
}): Result.Result<ProjectTab, ProjectEntToTabError> {
  return Result.pipe(
    Result.succeed(item),
    Result.bind('tabProps', v =>
      getTabProps<ProjectSt, ProjectLt>({
        ent: v.ent,
        tabService: v.tabService
      })
    ),
    Result.map((v): ProjectTab => ({ ...v.ent, ...v.tabProps.props }))
  );
}
