import * as apiObjects from '../../../objects/_index';
import * as apiEnums from '../../../enums/_index';

export interface CypressSeedRequestBody {
  payload: {
    users?: Array<{
      user_id: string;
      password: string;
      email_verification_token: string;
      status: apiEnums.UserStatusEnum;
    }>;
  };
}
