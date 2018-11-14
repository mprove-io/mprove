import { createSelector } from '@ngrx/store';
// tslint:disable-next-line:max-line-length
import { getSelectedProjectModeRepoFileId } from 'app/store/selectors/get-selected-project-mode-repo-file/get-selected-project-mode-repo-file-id';
// tslint:disable-next-line:max-line-length
import { getSelectedProjectModeRepoConflicts } from 'app/store/selectors/get-selected-project-mode-repo/get-selected-project-mode-repo-conflicts';

export const getSelectedProjectModeRepoFileConflictsLines = createSelector(
  getSelectedProjectModeRepoConflicts,
  getSelectedProjectModeRepoFileId,
  (repoConflicts, fileId) => {
    if (repoConflicts && fileId) {
      let fileLines: number[] = [];
      repoConflicts
        .filter(l => l.file_id === fileId)
        .forEach(line => {
          if (
            fileLines.findIndex(element => element === line.line_number) < 0
          ) {
            fileLines.push(line.line_number);
          }
        });
      return fileLines;
    } else {
      return [];
    }
  }
);
