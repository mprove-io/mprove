import { interfaces } from '~api/barrels/interfaces';

export class ToBlockmlWorkerGenSqlRequest extends interfaces.ToBlockmlWorkerRequest {
  readonly payload: any;
}

export class ToBlockmlWorkerGenSqlResponse extends interfaces.MyResponse {
  readonly payload: any;
}
