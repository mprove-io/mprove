import * as actions from '@app/store-actions/actions';

export type ViewsActions =
  | actions.UpdateViewsStateAction
  | actions.ResetViewsStateAction
  | actions.CleanViewsStateAction;
