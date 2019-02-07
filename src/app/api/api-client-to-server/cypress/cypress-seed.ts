export interface CypressSeedRequestBody {
  payload: {
    users?: Array<{
      user_id: string;
      password?: string;
      email_verified: boolean;
      email_verification_token?: string;
      password_reset_token?: string;
    }>;
    projects?: Array<{
      project_id: string;
      has_credentials: boolean;
    }>;
    members?: Array<{
      project_id: string;
      member_id: string;
      is_admin: boolean;
      is_editor: boolean;
    }>;
  };
}

export interface CypressSeedResponse200Body {
  payload: {
    empty: boolean;
  };
}
