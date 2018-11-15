import { api } from '../../barrels/api';
import { helper } from '../../barrels/helper';

export function wrapBlockmlRequest(payload: any) {
  let data = {
    info: {
      origin: api.CommunicationOriginEnum.SERVER,
      type: api.CommunicationTypeEnum.REQUEST,
      request_id: helper.makeId() // TODO: blockml request_id
    },
    payload: payload
  };

  return data;
}
