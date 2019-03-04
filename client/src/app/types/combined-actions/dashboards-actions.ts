import * as actions from '@app/store-actions/actions';

export type DashboardsActions =
  | actions.UpdateDashboardsStateAction
  | actions.ResetDashboardsStateAction
  | actions.CleanDashboardsStateAction;
