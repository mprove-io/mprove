import { api } from '../../barrels/api';

export function sendClientResponse(req: any, res: any, payload: any) {
  res.json({
    info: {
      origin: api.CommunicationOriginEnum.SERVER,
      type: api.CommunicationTypeEnum.RESPONSE,
      reply_to: req.body.info.request_id, // checked in middleware
      status: api.ServerResponseStatusEnum.Ok
    },
    payload: payload
  });
}
