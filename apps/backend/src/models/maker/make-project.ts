import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';

export function makeProject(item: {
  orgId: string;
  projectId?: string;
  name: string;
}) {
  let projectEntity: entities.ProjectEntity = {
    org_id: item.orgId,
    project_id: item.projectId || common.makeId(),
    name: item.name,
    server_ts: undefined
  };
  return projectEntity;
}
