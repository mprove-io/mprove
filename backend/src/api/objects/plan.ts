export interface Plan {
  plan_id: number;
  name: string;
  billing_type: string;
  billing_period: number;
  initial_price_usd: string;
  recurring_price_usd: string;
  deleted: boolean;
  server_ts: number;
}
