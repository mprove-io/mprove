import { createSelector } from '@ngrx/store';

import { getSelectedProjectModeRepoFile } from 'app/store/selectors/get-selected-project-mode-repo-file/get-selected-project-mode-repo-file';
import * as api from 'app/api/_index';
import { MyRegex } from 'app/models/my-regex';

export const getSelectedProjectModeRepoFileIsView = createSelector(
  getSelectedProjectModeRepoFile,
  (selectedFile: api.CatalogFile) => {
    if (selectedFile) {
      let r = MyRegex.CAPTURE_FILE_ID_AND_EXT().exec(selectedFile.name);

      let id;
      let ext;

      if (r) {
        id = r[1];
        ext = r[2];
      }

      return ext === 'view';
    } else {
      return undefined;
    }
  }
);
