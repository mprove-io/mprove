import * as apiObjects from '../../../objects/_index';
import * as apiEnums from '../../../enums/_index';

export interface CypressSeedRequestBody {
  payload: {
    users?: Array<{
      user_id: string;
      password?: string;
      email_verified: boolean;
      email_verification_token?: string;
      password_reset_token?: string;
    }>;
  };
}
