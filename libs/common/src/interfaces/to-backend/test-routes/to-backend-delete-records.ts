import { Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { MyResponse } from '~common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

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
}

export class ToBackendDeleteRecordsRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendDeleteRecordsRequestPayload)
  payload: ToBackendDeleteRecordsRequestPayload;
}

export class ToBackendDeleteRecordsResponse extends MyResponse {
  payload: { [k in any]: never };
}
