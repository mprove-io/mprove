import * as apiObjects from '../../objects/_index';

export interface DeleteMemberRequestBody {
  info: apiObjects.ClientRequest;
  payload: {
    project_id: string;
    member_id: string;
    server_ts: number;
  };
}

export interface DeleteMemberResponse200Body {
  info: apiObjects.ServerResponse;
  payload: {
    member: apiObjects.Member;
  };
}
