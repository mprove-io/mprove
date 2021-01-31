import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import * as apiEnums from '~/enums/_index';
import * as apiObjects from '~/objects/_index';

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
  @IsEnum(apiEnums.BoolEnum)
  isEmailVerified?: apiEnums.BoolEnum;

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

export class ToBackendSeedRecordsRequest {
  @ValidateNested()
  @Type(() => apiObjects.ToBackendRequestInfo)
  readonly info: apiObjects.ToBackendRequestInfo;

  @ValidateNested()
  @Type(() => ToBackendSeedRecordsRequestPayload)
  readonly payload: ToBackendSeedRecordsRequestPayload;
}

export class ToBackendSeedRecordsResponse {
  @ValidateNested()
  @Type(() => apiObjects.ResponseInfo)
  readonly info: apiObjects.ResponseInfo;

  readonly payload: { [K in any]: never };
}
