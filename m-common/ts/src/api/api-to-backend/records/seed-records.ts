import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import * as apiObjects from '~/api/objects/_index';
import * as apiEnums from '~/api/enums/_index';

export class ToBackendSeedRecordsRequestPayloadUsers {
  @IsString()
  userId: string;

  @IsString()
  password: string;

  @IsEnum(apiEnums.BoolEnum)
  isEmailVerified: apiEnums.BoolEnum;

  @IsString()
  emailVerificationToken: string;

  @IsString()
  passwordResetToken: string;
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

  readonly payload: {
    [K in any]: never;
  };
}
