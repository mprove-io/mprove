import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { MconfigX } from '~common/interfaces/backend/mconfig-x';
import { Mconfig } from '~common/interfaces/blockml/mconfig';
import { MyResponse } from '~common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

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
  @Type(() => Mconfig)
  mconfig: Mconfig;
}

export class ToBackendCreateTempMconfigRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendCreateTempMconfigRequestPayload)
  payload: ToBackendCreateTempMconfigRequestPayload;
}

export class ToBackendCreateTempMconfigResponsePayload {
  @ValidateNested()
  @Type(() => MconfigX)
  mconfig: MconfigX;
}

export class ToBackendCreateTempMconfigResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendCreateTempMconfigResponsePayload)
  payload: ToBackendCreateTempMconfigResponsePayload;
}
