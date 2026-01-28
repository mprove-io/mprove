import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { MconfigX } from '#common/interfaces/backend/mconfig-x';
import { Query } from '#common/interfaces/blockml/query';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

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
  @Type(() => MconfigX)
  mconfig: MconfigX;

  @ValidateNested()
  @Type(() => Query)
  query: Query;
}

export class ToBackendDuplicateMconfigAndQueryResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendDuplicateMconfigAndQueryResponsePayload)
  payload: ToBackendDuplicateMconfigAndQueryResponsePayload;
}
