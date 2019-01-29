import { createSelector } from '@ngrx/store';
import { getSelectedProjectId } from '@app/store/selectors/get-selected-project/get-selected-project-id';
import { getMembersState } from '@app/store/selectors/get-state/get-members-state';
import * as api from '@app/api/_index';

export const getSelectedProjectMembers = createSelector(
  getMembersState,
  getSelectedProjectId,
  (members: api.Member[], projectId: string) => {
    if (members && projectId) {
      return members
        .filter(
          (member: api.Member) =>
            member.project_id === projectId && member.deleted === false
        )
        .map((member: api.Member) =>
          Object.assign({}, member, {
            name: member.first_name + ' ' + member.last_name
          })
        );
    } else {
      return [];
    }
  }
);
