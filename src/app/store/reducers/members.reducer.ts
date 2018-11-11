import * as api from 'app/api/_index';
import * as actionTypes from 'app/store/action-types';
import * as types from 'app/types/_index';

const initialState: api.Member[] = [];

export function membersReducer(state = initialState, action: types.MembersActions): api.Member[] {

  switch (action.type) {

    case actionTypes.UPDATE_MEMBERS_STATE: {
      let newState = [...state];

      action.payload.forEach((cv) => {
        let index = newState.findIndex((member) =>
          member.member_id === cv.member_id &&
          member.project_id === cv.project_id);

        if (index >= 0) {

          if (cv.server_ts > newState[index].server_ts) {
            newState = [
              ...newState.slice(0, index),
              cv,
              ...newState.slice(index + 1)];
          }

        } else {
          newState.push(cv);
        }

      });

      return newState;
    }

    case actionTypes.RESET_MEMBERS_STATE: {
      return [...initialState];
    }

    default: {
      return state;
    }

  }
}
