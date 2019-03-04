import * as apiObjects from '../../objects/_index';

export interface SetUserPictureRequestBody {
  info: apiObjects.ClientRequest;
  payload: {
    picture_content: string;
    server_ts: number;
  };
}

export interface SetUserPictureResponse200Body {
  info: apiObjects.ServerResponse;
  payload: {
    user: apiObjects.User;
    members: apiObjects.Member[];
  };
}
