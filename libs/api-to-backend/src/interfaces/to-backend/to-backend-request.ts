import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequestInfo } from './to-backend-request-info';

export class ToBackendRequest extends common.MyRequest {
  @ValidateNested()
  @Type(() => ToBackendRequestInfo)
  readonly info: ToBackendRequestInfo;
}
