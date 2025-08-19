import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { MyRequest } from '../to/my-request';
import { ToBackendRequestInfo } from './to-backend-request-info';

export class ToBackendRequest extends MyRequest {
  @ValidateNested()
  @Type(() => ToBackendRequestInfo)
  info: ToBackendRequestInfo;
}
