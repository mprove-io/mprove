export interface Payment {
    payment_id: number;
    subscription_id: number;
    plan_id: number;
    project_id: string;
    amount: number;
    currency: string;
    payout_date: string;
    is_paid: number;
    receipt_url: string;
    deleted: boolean;
    server_ts: number;
}
