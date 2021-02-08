import { IsDefined } from 'class-validator';
import { RequestInfo } from './request-info';

export class MyRequest {
  @IsDefined()
  readonly info: RequestInfo;

  @IsDefined()
  readonly payload: any;
}
