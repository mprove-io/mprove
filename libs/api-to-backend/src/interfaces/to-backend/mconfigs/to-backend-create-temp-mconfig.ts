import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendCreateTempMconfigRequestPayload {
  @ValidateNested()
  @Type(() => common.Mconfig)
  mconfig: common.Mconfig;
}

export class ToBackendCreateTempMconfigRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendCreateTempMconfigRequestPayload)
  payload: ToBackendCreateTempMconfigRequestPayload;
}

export class ToBackendCreateTempMconfigResponse extends common.MyResponse {
  payload: { [k in any]: never };
}
