export interface CypressSeedRequestBody {
  payload: {
    users?: Array<{
      user_id: string;
      password?: string;
      email_verified: boolean;
      email_verification_token?: string;
      password_reset_token?: string;
    }>;
    projects?: {
      project_id: string;
    };
    members?: {
      project_id: string;
      member_id: string;
    };
  };
}

export interface CypressSeedResponse200Body {
  payload: {
    empty: boolean;
  };
}
