import { Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendGetRebuildStructRequestPayload {
  @IsString()
  orgId: string;

  @IsString()
  projectId: string;

  @IsString()
  repoId: string;

  @IsString()
  branch: string;

  @IsString()
  envId: string;

  @IsOptional()
  @IsString()
  overrideTimezone: string;
}

export class ToBackendGetRebuildStructRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendGetRebuildStructRequestPayload)
  payload: ToBackendGetRebuildStructRequestPayload;
}
