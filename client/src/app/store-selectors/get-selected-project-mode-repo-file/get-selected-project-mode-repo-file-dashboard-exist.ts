import { createSelector } from '@ngrx/store';
import { getSelectedProjectModeRepoDashboardsNotTemp } from '@app/store-selectors/get-selected-project-mode-repo-dashboards/get-selected-project-mode-repo-dashboards-not-temp';
import { getSelectedProjectModeRepoFile } from '@app/store-selectors/get-selected-project-mode-repo-file/get-selected-project-mode-repo-file';
import { getSelectedProjectModeRepoFileIsDashboard } from '@app/store-selectors/get-selected-project-mode-repo-file/get-selected-project-mode-repo-file-is-dashboard';
import * as api from '@app/api/_index';
import { MyRegex } from '@app/models/my-regex';

export const getSelectedProjectModeRepoFileDashboardExist = createSelector(
  getSelectedProjectModeRepoFile,
  getSelectedProjectModeRepoDashboardsNotTemp,
  getSelectedProjectModeRepoFileIsDashboard,
  (
    selectedFile: api.CatalogFile,
    dashboards: api.Dashboard[],
    fileIsDashboard
  ) => {
    if (selectedFile && dashboards && fileIsDashboard !== undefined) {
      let r = MyRegex.CAPTURE_FILE_ID_AND_EXT().exec(selectedFile.name);

      if (r) {
        let id = r[1];
        let ext = r[2];

        return fileIsDashboard
          ? dashboards.findIndex(d => d.dashboard_id === id) > -1
          : false;
      }
    } else {
      return undefined;
    }
  }
);
