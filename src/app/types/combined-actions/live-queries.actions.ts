import * as actions from '@app/store-actions/actions';

export type LiveQueriesActions =
  | actions.SetLiveQueriesAction
  | actions.SetLiveQueriesSuccessAction
  | actions.SetLiveQueriesFailAction;
