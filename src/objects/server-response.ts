import * as api from '../_index';

export interface ServerResponse {
    origin: api.ServerResponseOriginEnum;
    type: api.ServerResponseTypeEnum;
    reply_to: string;
    status: api.ServerResponseStatusEnum;
    error: api.ServerResponsePackageError;
}