import { createSelector } from '@ngrx/store';
import { getSelectedProjectId } from 'app/store/selectors/get-selected-project/get-selected-project-id';
import { getMembersState } from 'app/store/selectors/get-state/get-members-state';
import { getUserId } from 'app/store/selectors/get-user/get-user-id';
import * as api from 'app/api/_index';

export const getSelectedProjectUserMember = createSelector(
  getMembersState,
  getSelectedProjectId,
  getUserId,
  (members: api.Member[], projectId: string, userId: string) => {
    if (members && projectId && userId) {
      return members.find(
        (member: api.Member) =>
          member.project_id === projectId &&
          member.member_id === userId &&
          member.deleted === false
      );
    } else {
      return undefined;
    }
  }
);
