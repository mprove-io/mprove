import * as apiEnums from '../enums/_index';

export interface Subscription {
  project_id: string;
  global_product: apiEnums.SubscriptionGlobalProductEnum;
  subscription_id: number;
  plan_id: number;
  billing_user_id: number;
  billing_user_email: string;
  state: apiEnums.SubscriptionStateEnum;
  signup_date: string;
  last_payment_amount: number;
  last_payment_currency: string;
  last_payment_date: string;
  next_payment_amount: number;
  next_payment_currency: string;
  next_payment_date: string;
  cancel_message: string;
  deleted: boolean;
  server_ts: number;
}
