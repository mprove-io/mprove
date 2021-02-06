import { common } from '~api-to-blockml/barrels/common';
import { ToBlockmlWorkerRequest } from '../to-blockml-worker-request';

export class ToBlockmlWorkerGenSqlRequest extends ToBlockmlWorkerRequest {
  readonly payload: any;
}

export class ToBlockmlWorkerGenSqlResponse extends common.MyResponse {
  readonly payload: any;
}
