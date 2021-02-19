import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';

export function wrapToApiProjectsItem(
  project: entities.ProjectEntity
): common.ProjectsItem {
  return {
    projectId: project.project_id,
    name: project.name,
    serverTs: Number(project.server_ts)
  };
}
