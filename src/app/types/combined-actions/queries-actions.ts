import * as actions from '@app/store/actions/_index';

export type QueriesActions =
  | actions.UpdateQueriesStateAction
  | actions.ResetQueriesStateAction
  | actions.CleanQueriesStateAction
  | actions.FilterQueriesStateAction;
