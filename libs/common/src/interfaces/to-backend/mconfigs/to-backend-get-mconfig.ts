import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { MconfigX } from '~common/interfaces/backend/mconfig-x';
import { MyResponse } from '~common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendGetMconfigRequestPayload {
  @IsString()
  projectId: string;

  @IsBoolean()
  isRepoProd: boolean;

  @IsString()
  branchId: string;

  @IsString()
  envId: string;

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
  @Type(() => MconfigX)
  mconfig: MconfigX;
}

export class ToBackendGetMconfigResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetMconfigResponsePayload)
  payload: ToBackendGetMconfigResponsePayload;
}
