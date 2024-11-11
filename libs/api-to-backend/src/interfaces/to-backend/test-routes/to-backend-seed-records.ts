import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendSeedRecordsRequestPayloadUsersItem {
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

  @IsOptional()
  @IsNumber()
  passwordResetExpiresTs?: number;
}

export class ToBackendSeedRecordsRequestPayloadOrgsItem {
  @IsOptional()
  @IsString()
  orgId?: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  ownerId?: string;

  @IsString()
  ownerEmail: string;
}

export class ToBackendSeedRecordsRequestPayloadProjectsItem {
  @IsString()
  orgId: string;

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsString()
  testProjectId?: string;

  @IsString()
  name: string;

  @IsString()
  defaultBranch: string;

  @IsEnum(common.ProjectRemoteTypeEnum)
  remoteType: common.ProjectRemoteTypeEnum;

  @IsOptional()
  @IsString()
  gitUrl?: string;

  @IsOptional()
  @IsString()
  publicKey?: string;

  @IsOptional()
  @IsString()
  privateKey?: string;
}

export class ToBackendSeedRecordsRequestPayloadMembersItem {
  @IsString()
  projectId: string;

  @IsString()
  email: string;

  @IsString()
  memberId: string;

  @IsOptional()
  @IsString({ each: true })
  roles?: string[];

  @IsOptional()
  @IsString({ each: true })
  envs?: string[];

  @IsEnum(common.BoolEnum)
  isAdmin: common.BoolEnum;

  @IsEnum(common.BoolEnum)
  isEditor: common.BoolEnum;

  @IsEnum(common.BoolEnum)
  isExplorer: common.BoolEnum;
}

export class ToBackendSeedRecordsRequestPayloadConnectionsItem {
  @IsString()
  projectId: string;

  @IsString()
  envId: string;

  @IsString()
  connectionId: string;

  @IsEnum(common.ConnectionTypeEnum)
  type: common.ConnectionTypeEnum;

  @IsOptional()
  @IsObject()
  bigqueryCredentials?: any;

  @IsOptional()
  @IsInt()
  bigqueryQuerySizeLimitGb?: number;

  @IsOptional()
  @IsString()
  account?: string;

  @IsOptional()
  @IsString()
  warehouse?: string;

  @IsOptional()
  @IsString()
  host?: string;

  @IsOptional()
  @IsInt()
  port?: number;

  @IsOptional()
  @IsString()
  database?: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsBoolean()
  isSSL?: boolean;
}

export class ToBackendSeedRecordsRequestPayloadEnvsItem {
  @IsString()
  projectId: string;

  @IsString()
  envId: string;
}

export class ToBackendSeedRecordsRequestPayloadEvsItem {
  @IsString()
  projectId: string;

  @IsString()
  envId: string;

  @IsString()
  evId: string;

  @IsString()
  val: string;
}

export class ToBackendSeedRecordsRequestPayload {
  @IsOptional()
  @ValidateNested()
  @Type(() => ToBackendSeedRecordsRequestPayloadUsersItem)
  users?: ToBackendSeedRecordsRequestPayloadUsersItem[];

  @IsOptional()
  @ValidateNested()
  @Type(() => ToBackendSeedRecordsRequestPayloadOrgsItem)
  orgs?: ToBackendSeedRecordsRequestPayloadOrgsItem[];

  @IsOptional()
  @ValidateNested()
  @Type(() => ToBackendSeedRecordsRequestPayloadProjectsItem)
  projects?: ToBackendSeedRecordsRequestPayloadProjectsItem[];

  @IsOptional()
  @ValidateNested()
  @Type(() => ToBackendSeedRecordsRequestPayloadMembersItem)
  members?: ToBackendSeedRecordsRequestPayloadMembersItem[];

  @IsOptional()
  @ValidateNested()
  @Type(() => ToBackendSeedRecordsRequestPayloadConnectionsItem)
  connections?: ToBackendSeedRecordsRequestPayloadConnectionsItem[];

  @IsOptional()
  @ValidateNested()
  @Type(() => ToBackendSeedRecordsRequestPayloadEnvsItem)
  envs?: ToBackendSeedRecordsRequestPayloadEnvsItem[];

  @IsOptional()
  @ValidateNested()
  @Type(() => ToBackendSeedRecordsRequestPayloadEvsItem)
  evs?: ToBackendSeedRecordsRequestPayloadEvsItem[];

  @IsOptional()
  @ValidateNested()
  @Type(() => common.Query)
  queries?: common.Query[];

  @IsOptional()
  @ValidateNested()
  @Type(() => common.Mconfig)
  mconfigs?: common.Mconfig[];
}

export class ToBackendSeedRecordsRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendSeedRecordsRequestPayload)
  payload: ToBackendSeedRecordsRequestPayload;
}

export class ToBackendSeedRecordsResponse extends common.MyResponse {
  payload: { [k in any]: never };
}
