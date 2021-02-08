import { IsDefined } from 'class-validator';
import { ResponseInfo } from './response-info';

export class MyResponse {
  @IsDefined()
  readonly info: ResponseInfo;

  @IsDefined()
  readonly payload: any;
}
