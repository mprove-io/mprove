import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';

export function makeProject(item: {
  orgId: string;
  projectId?: string;
  name: string;
  weekStart?: common.ProjectWeekStartEnum;
  timezone?: string;
  allowTimezones?: common.BoolEnum;
}) {
  let projectEntity: entities.ProjectEntity = {
    org_id: item.orgId,
    project_id: item.projectId || common.makeId(),
    name: item.name,
    week_start: item.weekStart || common.ProjectWeekStartEnum.Sunday,
    timezone: item.timezone || common.UTC,
    allow_timezones: item.allowTimezones || common.BoolEnum.TRUE,
    server_ts: undefined
  };
  return projectEntity;
}
