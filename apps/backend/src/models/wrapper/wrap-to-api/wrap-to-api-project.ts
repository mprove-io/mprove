import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';

export function wrapToApiProject(
  project: entities.ProjectEntity
): common.Project {
  return {
    orgId: project.org_id,
    projectId: project.project_id,
    name: project.name,
    serverTs: Number(project.server_ts)
  };
}
