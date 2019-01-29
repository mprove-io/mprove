import { createSelector } from '@ngrx/store';
import { getLayoutProjectId } from '@app/store/selectors/get-layout/get-layout-project-id';
import { getProjectsState } from '@app/store/selectors/get-state/get-projects-state';
import * as api from '@app/api/_index';

export const getSelectedProject = createSelector(
  getProjectsState,
  getLayoutProjectId,
  (projects: api.Project[], projectId: string) => {
    if (projects && projectId) {
      let selectedIndex = projects.findIndex(
        (project: api.Project) => project.project_id === projectId
      );
      return selectedIndex >= 0 ? projects[selectedIndex] : undefined;
    } else {
      return undefined;
    }
  }
);
