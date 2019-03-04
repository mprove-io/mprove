export interface ProcessMessage {
  type: string;
  task_id: string;
  outcome_id: string;
  error: any;
}