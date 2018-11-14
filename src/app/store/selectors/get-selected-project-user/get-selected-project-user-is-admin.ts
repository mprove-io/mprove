// tslint:disable:max-line-length
import { createSelector } from '@ngrx/store';
import { getSelectedProjectMembers } from 'app/store/selectors/get-selected-project-members/get-selected-project-members';
import { getUserId } from 'app/store/selectors/get-user/get-user-id';
import * as api from 'app/api/_index';

export const getSelectedProjectUserIsAdmin = createSelector(
  getSelectedProjectMembers,
  getUserId,
  (members, userId) => {
    if (members && userId) {
      let userIndex = members.findIndex(
        (member: api.Member) => member.member_id === userId
      );
      return userIndex >= 0 ? members[userIndex].is_admin : undefined;
    } else {
      return undefined;
    }
  }
);
