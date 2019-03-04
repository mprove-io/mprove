import { api } from '../../barrels/api';

export function wrapWebsocketMessage(item: {
  session_id: string,
  message_id: string,
  action: api.ServerRequestToClientActionEnum;
  payload: any,
}) {

  let data = JSON.stringify({
    info: {
      origin: api.CommunicationOriginEnum.SERVER,
      type: api.CommunicationTypeEnum.REQUEST,
      init_id: item.session_id,
      request_id: item.message_id,
      action: item.action,
    },
    payload: item.payload
  });

  return data;
}
