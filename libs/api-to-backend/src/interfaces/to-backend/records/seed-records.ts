import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendSeedRecordsRequestPayloadUsers {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsString()
  email: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsEnum(common.BoolEnum)
  isEmailVerified?: common.BoolEnum;

  @IsOptional()
  @IsString()
  emailVerificationToken?: string;

  @IsOptional()
  @IsString()
  passwordResetToken?: string;
}

export class ToBackendSeedRecordsRequestPayload {
  @IsOptional()
  @ValidateNested()
  @Type(() => ToBackendSeedRecordsRequestPayloadUsers)
  readonly users?: ToBackendSeedRecordsRequestPayloadUsers[];
}

export class ToBackendSeedRecordsRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendSeedRecordsRequestPayload)
  readonly payload: ToBackendSeedRecordsRequestPayload;
}

export class ToBackendSeedRecordsResponse extends common.MyResponse {
  readonly payload: { [K in any]: never };
}
