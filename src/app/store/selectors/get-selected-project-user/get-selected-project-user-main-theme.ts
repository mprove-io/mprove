// tslint:disable:max-line-length
import { createSelector } from '@ngrx/store';
import { getSelectedProjectMembers } from 'src/app/store/selectors/get-selected-project-members/get-selected-project-members';
import { getUserId } from 'src/app/store/selectors/get-user/get-user-id';
import * as api from 'src/app/api/_index';

export const getSelectedProjectUserMainTheme = createSelector(
  getSelectedProjectMembers,
  getUserId,
  (members, userId) => {

    if (members && userId) {
      return members.find((member: api.Member) => member.member_id === userId).main_theme;

    } else {
      return undefined;
    }
  }
);
