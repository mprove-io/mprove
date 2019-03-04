import * as apiObjects from '../../objects/_index';

export interface EditMemberRequestBody {
  info: apiObjects.ClientRequest;
  payload: {
    project_id: string;
    member_id: string;
    is_editor: boolean;
    is_admin: boolean;
    server_ts: number;
  };
}

export interface EditMemberResponse200Body {
  info: apiObjects.ServerResponse;
  payload: {
    member: apiObjects.Member;
  };
}
