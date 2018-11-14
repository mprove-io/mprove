import { createSelector } from '@ngrx/store';
import { getSelectedProjectModeRepoFile } from 'app/store/selectors/get-selected-project-mode-repo-file/get-selected-project-mode-repo-file';
import { getSelectedProjectModeRepoFileIsModel } from 'app/store/selectors/get-selected-project-mode-repo-file/get-selected-project-mode-repo-file-is-model';
import { getSelectedProjectModeRepoStructModels } from 'app/store/selectors/get-selected-project-mode-repo-struct-models/get-selected-project-mode-repo-struct-models';
import * as api from 'app/api/_index';
import { MyRegex } from 'app/models/my-regex';

export const getSelectedProjectModeRepoFileModelExist = createSelector(
  getSelectedProjectModeRepoFile,
  getSelectedProjectModeRepoStructModels,
  getSelectedProjectModeRepoFileIsModel,
  (selectedFile: api.CatalogFile, models: api.Model[], fileIsModel) => {
    if (selectedFile && models && fileIsModel !== undefined) {
      let r = MyRegex.CAPTURE_FILE_ID_AND_EXT().exec(selectedFile.name);

      if (r) {
        let id = r[1];
        let ext = r[2];

        return fileIsModel
          ? models.findIndex(m => m.model_id === id) > -1
          : false;
      }
    } else {
      return undefined;
    }
  }
);
