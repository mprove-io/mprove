import { createSelector } from '@ngrx/store';
// tslint:disable-next-line:max-line-length
import { getSelectedProjectModeRepoErrors } from 'app/store/selectors/get-selected-project-mode-repo-errors/get-selected-project-mode-repo-errors';
// tslint:disable-next-line:max-line-length
import { getSelectedProjectModeRepoFileId } from 'app/store/selectors/get-selected-project-mode-repo-file/get-selected-project-mode-repo-file-id';
import * as api from 'app/api/_index';

export const getSelectedProjectModeRepoFileErrorsLines = createSelector(
  getSelectedProjectModeRepoErrors,
  getSelectedProjectModeRepoFileId,
  (repoErrors: api.SwError[], fileId: string) => {
    if (repoErrors && fileId) {
      let fileLines: number[] = [];
      repoErrors.forEach((error: api.SwError) =>
        error.lines
          .filter(l => l.file_id === fileId)
          .forEach(line => {
            if (
              fileLines.findIndex(element => element === line.line_number) < 0
            ) {
              fileLines.push(line.line_number);
            }
          })
      );
      return fileLines;
    } else {
      return [];
    }
  }
);
