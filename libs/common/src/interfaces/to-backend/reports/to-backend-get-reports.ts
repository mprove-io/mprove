import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { Member } from '#common/interfaces/backend/member';
import { ModelX } from '#common/interfaces/backend/model-x';
import { ReportX } from '#common/interfaces/backend/report-x';
import { StructX } from '#common/interfaces/backend/struct-x';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendGetReportsRequestPayload {
  @IsString()
  projectId: string;

  @IsString()
  repoId: string;

  @IsString()
  branchId: string;

  @IsString()
  envId: string;
}

export class ToBackendGetReportsRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendGetReportsRequestPayload)
  payload: ToBackendGetReportsRequestPayload;
}

export class ToBackendGetReportsResponsePayload {
  @IsBoolean()
  needValidate: boolean;

  @ValidateNested()
  @Type(() => StructX)
  struct: StructX;

  @ValidateNested()
  @Type(() => Member)
  userMember: Member;

  @ValidateNested()
  reports: ReportX[];

  @ValidateNested()
  @Type(() => ModelX)
  storeModels: ModelX[];
}

export class ToBackendGetReportsResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetReportsResponsePayload)
  payload: ToBackendGetReportsResponsePayload;
}
