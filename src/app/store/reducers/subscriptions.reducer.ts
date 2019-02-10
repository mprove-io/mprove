import * as api from '@app/api/_index';
import * as actionTypes from '@app/store-action-types/index';
import * as types from '@app/types/_index';

const initialState: api.Subscription[] = [];

export function subscriptionsReducer(
  state = initialState,
  action: types.SubscriptionsActions
): api.Subscription[] {
  switch (action.type) {
    case actionTypes.UPDATE_SUBSCRIPTIONS_STATE: {
      let newState = [...state];

      action.payload.forEach(cv => {
        let index = newState.findIndex(
          subscription => subscription.subscription_id === cv.subscription_id
          // && subscription.project_id === cv.project_id     // no need because subscription_id is globally unique
        );

        if (index >= 0) {
          if (cv.server_ts > newState[index].server_ts) {
            newState = [
              ...newState.slice(0, index),
              cv,
              ...newState.slice(index + 1)
            ];
          }
        } else {
          newState.push(cv);
        }
      });

      return newState;
    }

    case actionTypes.RESET_SUBSCRIPTIONS_STATE: {
      return [...initialState];
    }

    default: {
      return state;
    }
  }
}
