import { createSelector } from '@ngrx/store';
import { getSelectedProjectMembers } from '@app/store/selectors/get-selected-project-members/get-selected-project-members';
import { getUserId } from '@app/store/selectors/get-user/get-user-id';
import * as api from '@app/api/_index';

export const getSelectedProjectUserFileTheme = createSelector(
  getSelectedProjectMembers,
  getUserId,
  (members, userId) => {
    if (members && members.length > 0 && userId) {
      return members.find((member: api.Member) => member.member_id === userId)
        .file_theme;
    } else {
      return undefined;
    }
  }
);
