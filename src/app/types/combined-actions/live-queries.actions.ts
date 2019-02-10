import * as actions from '@app/store-actions/_index';

export type LiveQueriesActions =
  | actions.SetLiveQueriesAction
  | actions.SetLiveQueriesSuccessAction
  | actions.SetLiveQueriesFailAction;
