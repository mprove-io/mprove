import { IsDefined } from 'class-validator';
import { ResponseInfo } from './response-info';

export class MyResponse {
  @IsDefined()
  info: ResponseInfo;

  @IsDefined()
  payload: any;
}
