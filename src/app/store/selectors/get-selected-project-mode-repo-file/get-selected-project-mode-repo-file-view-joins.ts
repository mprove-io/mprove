// tslint:disable:max-line-length
import { createSelector } from '@ngrx/store';
import { getSelectedProjectModeRepoFile } from 'app/store/selectors/get-selected-project-mode-repo-file/get-selected-project-mode-repo-file';
import { getSelectedProjectModeRepoFileIsView } from 'app/store/selectors/get-selected-project-mode-repo-file/get-selected-project-mode-repo-file-is-view';
import { getSelectedProjectModeRepoStructModels } from 'app/store/selectors/get-selected-project-mode-repo-struct-models/get-selected-project-mode-repo-struct-models';
import * as api from 'app/api/_index';
import { MyRegex } from 'app/models/my-regex';

export const getSelectedProjectModeRepoFileViewJoins = createSelector(
  getSelectedProjectModeRepoFile,
  getSelectedProjectModeRepoStructModels,
  getSelectedProjectModeRepoFileIsView,
  (selectedFile: api.CatalogFile, models: api.Model[], fileIsView) => {
    let viewJoins: Array<{ model: api.Model; join_as: string }> = [];

    if (selectedFile && models && fileIsView !== undefined) {
      let r = MyRegex.CAPTURE_FILE_ID_AND_EXT().exec(selectedFile.name);

      if (r) {
        let id = r[1];
        let ext = r[2];

        models.forEach(model => {
          model.nodes.forEach(node => {
            if (
              node.node_class === api.ModelNodeNodeClassEnum.Join &&
              node.view_name === id
            ) {
              viewJoins.push({ model: model, join_as: node.id });
              return;
            }
          });
        });
      }
    }

    return viewJoins;
  }
);
