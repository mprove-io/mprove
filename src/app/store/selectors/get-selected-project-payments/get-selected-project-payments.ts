// tslint:disable:max-line-length
import { createSelector } from '@ngrx/store';
import { getSelectedProjectId } from 'src/app/store/selectors/get-selected-project/get-selected-project-id';
import { getPaymentsState } from 'src/app/store/selectors/get-state/get-payments-state';
import * as api from 'src/app/api/_index';

export const getSelectedProjectPayments = createSelector(
  getPaymentsState,
  getSelectedProjectId,
  (payments: api.Payment[], projectId: string) => {

    if (payments && projectId) {
      return payments
        .filter((payment: api.Payment) => payment.project_id === projectId && payment.deleted === false)
        .sort((a, b) => {
          if (a.payment_id < b.payment_id) { // sort string ascending
            return -1;
          }
          if (a.payment_id > b.payment_id) {
            return 1;
          }
          return 0; // default return value (no sorting)
        })
        .reverse();

    } else {
      return [];
    }
  }
);
