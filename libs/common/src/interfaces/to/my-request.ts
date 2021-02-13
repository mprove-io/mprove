import { IsDefined } from 'class-validator';
import { RequestInfo } from './request-info';

export class MyRequest {
  @IsDefined()
  info: RequestInfo;

  @IsDefined()
  payload: any;
}
