import * as api from '../_index';

export interface ClientRequest {
    type: api.ClientRequestTypeEnum;

    origin: api.ClientRequestOriginEnum;

    request_id: string;

    init_id: string;

}