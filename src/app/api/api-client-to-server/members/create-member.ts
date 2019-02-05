import * as apiObjects from '../../objects/_index';

export interface CreateMemberRequestBody {
  info: apiObjects.ClientRequest;
  payload: {
    project_id: string;
    member_id: string;
    url: string;
  };
}

export interface CreateMemberResponse200Body {
  info: apiObjects.ServerResponse;
  payload: {
    member: apiObjects.Member;

  };
}
