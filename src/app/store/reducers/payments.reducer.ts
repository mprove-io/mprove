import * as api from 'app/api/_index';
import * as actionTypes from 'app/store/action-types';
import * as types from 'app/types/_index';

const initialState: api.Payment[] = [];

export function paymentsReducer(state = initialState, action: types.PaymentsActions): api.Payment[] {

  switch (action.type) {

    case actionTypes.UPDATE_PAYMENTS_STATE: {
      let newState = [...state];

      action.payload.forEach((cv) => {
        let index = newState.findIndex((payment) =>
          payment.payment_id === cv.payment_id
          // && payment.project_id === cv.project_id     // no need because payment_id is globally unique
        );

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

    case actionTypes.RESET_PAYMENTS_STATE: {
      return [...initialState];
    }

    default: {
      return state;
    }

  }
}
