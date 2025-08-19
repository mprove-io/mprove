export interface Idemp {
  idempotencyKey: string;
  stId: string;
  req: any;
  resp: any;
  serverTs: number;
}
