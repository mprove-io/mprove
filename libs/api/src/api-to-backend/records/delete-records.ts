import { Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { interfaces } from '~api/barrels/interfaces';

export class ToBackendDeleteRecordsRequestPayload {
  @IsOptional()
  @IsString({ each: true })
  readonly emails?: string[];

  @IsOptional()
  @IsString({ each: true })
  readonly organizationIds?: string[];
}

export class ToBackendDeleteRecordsRequest extends interfaces.ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendDeleteRecordsRequestPayload)
  readonly payload: ToBackendDeleteRecordsRequestPayload;
}

export class ToBackendDeleteRecordsResponse extends interfaces.MyResponse {
  readonly payload: { [K in any]: never };
}
