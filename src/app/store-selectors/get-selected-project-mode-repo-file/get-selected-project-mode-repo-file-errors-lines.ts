import { createSelector } from '@ngrx/store';

import { getSelectedProjectModeRepoErrors } from '@app/store-selectors/get-selected-project-mode-repo-errors/get-selected-project-mode-repo-errors';

import { getSelectedProjectModeRepoFileId } from '@app/store-selectors/get-selected-project-mode-repo-file/get-selected-project-mode-repo-file-id';
import * as api from '@app/api/_index';

export const getSelectedProjectModeRepoFileErrorsLines = createSelector(
  getSelectedProjectModeRepoErrors,
  getSelectedProjectModeRepoFileId,
  (repoErrors: api.SwError[], fileId: string) => {
    if (repoErrors && fileId) {
      let fileLines: Array<{ line_num: number; info: string }> = [];
      repoErrors.forEach((error: api.SwError) =>
        error.lines
          .filter(l => l.file_id === fileId)
          .forEach(line => {
            if (
              fileLines.findIndex(
                element => element.line_num === line.line_number
              ) < 0
            ) {
              fileLines.push({
                line_num: line.line_number,
                info: `${error.type}: \n${error.message}`
              });
            }
          })
      );
      return fileLines;
    } else {
      return [];
    }
  }
);
