/**
 * Export a type alias of all actions in this action group
 * so that reducers can easily compose action types
 */
import * as actions from '@app/store-actions/actions';

export type LayoutActions =
  | actions.UpdateLayoutEmailToVerifyAction
  | actions.UpdateLayoutEmailToResetPasswordAction
  | actions.UpdateLayoutProjectIdAction
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
  | actions.UpdateLayoutLastWebsocketMessageTimestampAction;
