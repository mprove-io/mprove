import { common } from '~api-to-blockml/barrels/common';
import { ToBlockmlWorkerRequest } from '~api-to-blockml/interfaces/to-blockml-worker/to-blockml-worker-request';

export class ToBlockmlWorkerGenSqlRequest extends ToBlockmlWorkerRequest {
  readonly payload: any;
}

export class ToBlockmlWorkerGenSqlResponse extends common.MyResponse {
  readonly payload: any;
}
