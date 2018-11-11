import * as actions from 'src/app/store/actions/_index';

export type WebSocketActions
  = actions.UpdateWebSocketInitIdAction
  | actions.ResetWebSocketStateAction
  | actions.OpenWebSocketSuccessAction
  | actions.CloseWebSocketSuccessAction
  ;
