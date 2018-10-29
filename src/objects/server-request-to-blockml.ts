import * as api from '../_index';

export interface ServerRequestToBlockml {
    origin: api.ServerRequestToBlockmlOriginEnum;
    type: api.ServerRequestToBlockmlTypeEnum;
    request_id: string;
}