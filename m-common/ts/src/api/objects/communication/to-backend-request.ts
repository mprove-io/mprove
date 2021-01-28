import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { Request } from './request';
import { ToBackendRequestInfo } from './to-backend-request-info';

export class ToBackendRequest implements Request {
  @ValidateNested()
  @Type(() => ToBackendRequestInfo)
  readonly info: ToBackendRequestInfo;

  readonly payload: any;
}
