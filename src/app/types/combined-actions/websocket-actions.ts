import * as actions from '@app/store-actions/actions';

export type WebSocketActions =
  | actions.UpdateWebSocketInitIdAction
  | actions.ResetWebSocketStateAction
  | actions.OpenWebSocketSuccessAction
  | actions.CloseWebSocketSuccessAction;
