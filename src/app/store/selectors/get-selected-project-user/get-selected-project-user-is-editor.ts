import { createSelector } from '@ngrx/store';
import { getSelectedProjectMembers } from 'app/store/selectors/get-selected-project-members/get-selected-project-members';
import { getUserId } from 'app/store/selectors/get-user/get-user-id';
import * as api from 'app/api/_index';

export const getSelectedProjectUserIsEditor = createSelector(
  getSelectedProjectMembers,
  getUserId,
  (members: api.Member[], userId: string) => {
    if (members && userId) {
      let userIndex = members.findIndex(
        (member: api.Member) => member.member_id === userId
      );
      return userIndex >= 0 ? members[userIndex].is_editor : undefined;
    } else {
      return undefined;
    }
  }
);
