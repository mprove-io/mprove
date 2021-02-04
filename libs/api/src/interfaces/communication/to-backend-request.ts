import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { MyRequest } from './my-request';
import { ToBackendRequestInfo } from './to-backend-request-info';

export class ToBackendRequest implements MyRequest {
  @ValidateNested()
  @Type(() => ToBackendRequestInfo)
  readonly info: ToBackendRequestInfo;

  readonly payload: any;
}
