import * as apiEnums from '../../enums/_index';

export interface ServerRequestToClient {
  origin: apiEnums.CommunicationOriginEnum;
  type: apiEnums.CommunicationTypeEnum;
  init_id: string;
  request_id: string;
  action: apiEnums.ServerRequestToClientActionEnum;
}
