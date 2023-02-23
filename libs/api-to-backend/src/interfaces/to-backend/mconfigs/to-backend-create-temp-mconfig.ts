import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendCreateTempMconfigRequestPayload {
  @IsString()
  projectId: string;

  @IsBoolean()
  isRepoProd: boolean;

  @IsString()
  branchId: string;

  @IsString()
  envId: string;

  @IsString()
  oldMconfigId: string;

  @ValidateNested()
  @Type(() => common.Mconfig)
  mconfig: common.Mconfig;
}

export class ToBackendCreateTempMconfigRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendCreateTempMconfigRequestPayload)
  payload: ToBackendCreateTempMconfigRequestPayload;
}

export class ToBackendCreateTempMconfigResponsePayload {
  @ValidateNested()
  @Type(() => common.MconfigX)
  mconfig: common.MconfigX;
}

export class ToBackendCreateTempMconfigResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendCreateTempMconfigResponsePayload)
  payload: ToBackendCreateTempMconfigResponsePayload;
}
