import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendGetMconfigRequestPayload {
  @IsString()
  mconfigId: string;
}

export class ToBackendGetMconfigRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendGetMconfigRequestPayload)
  payload: ToBackendGetMconfigRequestPayload;
}

export class ToBackendGetMconfigResponsePayload {
  @ValidateNested()
  @Type(() => common.MconfigX)
  mconfig: common.MconfigX;
}

export class ToBackendGetMconfigResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetMconfigResponsePayload)
  payload: ToBackendGetMconfigResponsePayload;
}
