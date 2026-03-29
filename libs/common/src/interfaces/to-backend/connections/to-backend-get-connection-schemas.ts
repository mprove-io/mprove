import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { CombinedSchemaItem } from '#common/interfaces/backend/connection-schemas/combined-schema';
import { Member } from '#common/interfaces/backend/member';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendGetConnectionSchemasRequestPayload {
  @IsString()
  projectId: string;

  @IsString()
  envId: string;

  @IsString()
  repoId: string;

  @IsString()
  branchId: string;

  @IsBoolean()
  isRefreshExistingCache: boolean;
}

export class ToBackendGetConnectionSchemasRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendGetConnectionSchemasRequestPayload)
  payload: ToBackendGetConnectionSchemasRequestPayload;
}

export class ToBackendGetConnectionSchemasResponsePayload {
  @ValidateNested()
  @Type(() => Member)
  userMember: Member;

  @ValidateNested()
  @Type(() => CombinedSchemaItem)
  combinedSchemaItems: CombinedSchemaItem[];
}

export class ToBackendGetConnectionSchemasResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetConnectionSchemasResponsePayload)
  payload: ToBackendGetConnectionSchemasResponsePayload;
}
