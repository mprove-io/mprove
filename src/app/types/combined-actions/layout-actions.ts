/**
 * Export a type alias of all actions in this action group
 * so that reducers can easily compose action types
 */
import * as actions from 'src/app/store/actions/_index';

export type LayoutActions
  = actions.UpdateLayoutProjectIdAction
  | actions.SetLayoutModeDevAction
  | actions.SetLayoutModeProdAction
  | actions.SetLayoutNeedSaveTrueAction
  | actions.SetLayoutNeedSaveFalseAction
  | actions.UpdateLayoutFileIdAction
  | actions.UpdateLayoutMconfigIdAction
  | actions.UpdateLayoutModelIdAction
  | actions.UpdateLayoutDashboardIdAction
  | actions.UpdateLayoutQueryIdAction
  | actions.UpdateLayoutChartIdAction
  | actions.UpdateLayoutDryAction
  | actions.ResetLayoutStateAction
  | actions.UpdateLayoutLastWebsocketMessageTimestampAction
  ;
