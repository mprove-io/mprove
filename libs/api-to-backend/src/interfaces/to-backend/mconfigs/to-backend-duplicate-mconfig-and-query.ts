import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendDuplicateMconfigAndQueryRequestPayload {
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
}

export class ToBackendDuplicateMconfigAndQueryRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendDuplicateMconfigAndQueryRequestPayload)
  payload: ToBackendDuplicateMconfigAndQueryRequestPayload;
}

export class ToBackendDuplicateMconfigAndQueryResponsePayload {
  @ValidateNested()
  @Type(() => common.MconfigX)
  mconfig: common.MconfigX;

  @ValidateNested()
  @Type(() => common.Query)
  query: common.Query;
}

export class ToBackendDuplicateMconfigAndQueryResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendDuplicateMconfigAndQueryResponsePayload)
  payload: ToBackendDuplicateMconfigAndQueryResponsePayload;
}
