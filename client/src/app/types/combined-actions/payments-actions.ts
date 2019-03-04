import * as actions from '@app/store-actions/actions';

export type PaymentsActions =
  | actions.UpdatePaymentsStateAction
  | actions.ResetPaymentsStateAction;
