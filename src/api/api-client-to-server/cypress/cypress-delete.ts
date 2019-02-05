export interface CypressDeleteRequestBody {
  payload: {
    user_ids?: string[];
    project_ids?: string[];
  };
}

export interface CypressDeleteResponse200Body {
  payload: {
    empty: boolean;
  };
}
