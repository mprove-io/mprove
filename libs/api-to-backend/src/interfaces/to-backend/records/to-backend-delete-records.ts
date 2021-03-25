import { Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendDeleteRecordsRequestPayload {
  @IsOptional()
  @IsString({ each: true })
  emails?: string[];

  @IsOptional()
  @IsString({ each: true })
  orgNames?: string[];

  @IsOptional()
  @IsString({ each: true })
  orgIds?: string[];

  @IsOptional()
  @IsString({ each: true })
  projectNames?: string[];

  @IsOptional()
  @IsString({ each: true })
  projectIds?: string[];

  @IsString({ each: true })
  idempotencyKeys: string[];
}

export class ToBackendDeleteRecordsRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendDeleteRecordsRequestPayload)
  payload: ToBackendDeleteRecordsRequestPayload;
}

export class ToBackendDeleteRecordsResponse extends common.MyResponse {
  payload: { [k in any]: never };
}
