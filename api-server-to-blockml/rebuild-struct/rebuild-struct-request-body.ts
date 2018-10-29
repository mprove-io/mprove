import * as api from '../../_index';

export interface RebuildStructRequestBody {
    info: api.ServerRequestToBlockml;

    payload: api.RebuildStructRequestBodyPayload;

}