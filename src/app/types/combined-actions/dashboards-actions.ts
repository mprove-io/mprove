import * as actions from 'app/store/actions/_index';

export type DashboardsActions =
  | actions.UpdateDashboardsStateAction
  | actions.ResetDashboardsStateAction
  | actions.CleanDashboardsStateAction;
