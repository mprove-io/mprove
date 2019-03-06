import * as apiEnums from '../../enums/_index';

export interface ClientRequest {
  type: apiEnums.CommunicationTypeEnum;
  origin: apiEnums.CommunicationOriginEnum;
  request_id: string;
  init_id: string;
}
