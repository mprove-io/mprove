import type { ProjectTab } from '#backend/drizzle/postgres/schema/_tabs';
import type { ProjectsItem } from '#common/types/backend/parts/projects-item';

export function wrapToApiProjectsItem(item: {
  project: ProjectTab;
}): ProjectsItem {
  let { project } = item;

  let apiProjectItem: ProjectsItem = {
    projectId: project.projectId,
    name: project.name,
    defaultBranch: project.defaultBranch
  };

  return apiProjectItem;
}
