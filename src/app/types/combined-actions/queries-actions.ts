import * as actions from '@app/store-actions/actions';

export type QueriesActions =
  | actions.UpdateQueriesStateAction
  | actions.ResetQueriesStateAction
  | actions.CleanQueriesStateAction
  | actions.FilterQueriesStateAction;
