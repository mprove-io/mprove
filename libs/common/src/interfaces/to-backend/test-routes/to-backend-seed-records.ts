import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { ConnectionTypeEnum } from '~common/enums/connection-type.enum';
import { ProjectRemoteTypeEnum } from '~common/enums/project-remote-type.enum';
import { ConnectionHeader } from '~common/interfaces/backend/connection-header';
import { Ev } from '~common/interfaces/backend/ev';
import { Mconfig } from '~common/interfaces/blockml/mconfig';
import { Query } from '~common/interfaces/blockml/query';
import { MyResponse } from '~common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

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
  @IsBoolean()
  isEmailVerified?: boolean;

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

  @IsEnum(ProjectRemoteTypeEnum)
  remoteType: ProjectRemoteTypeEnum;

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

  @IsBoolean()
  isAdmin: boolean;

  @IsBoolean()
  isEditor: boolean;

  @IsBoolean()
  isExplorer: boolean;
}

export class ToBackendSeedRecordsRequestPayloadConnectionsItem {
  @IsString()
  projectId: string;

  @IsString()
  envId: string;

  @IsString()
  connectionId: string;

  @IsEnum(ConnectionTypeEnum)
  type: ConnectionTypeEnum;

  @IsOptional()
  @IsString()
  baseUrl?: string;

  @IsOptional()
  @IsString()
  motherduckToken?: string;

  @IsOptional()
  serviceAccountCredentials?: any;

  @IsOptional()
  @ValidateNested()
  @Type(() => ConnectionHeader)
  headers?: ConnectionHeader[];

  @IsOptional()
  @ValidateNested()
  @IsString({ each: true })
  googleAuthScopes?: string[];

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

  @IsOptional()
  @ValidateNested()
  @Type(() => Ev)
  evs: Ev[];
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
  @Type(() => Query)
  queries?: Query[];

  @IsOptional()
  @ValidateNested()
  @Type(() => Mconfig)
  mconfigs?: Mconfig[];
}

export class ToBackendSeedRecordsRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendSeedRecordsRequestPayload)
  payload: ToBackendSeedRecordsRequestPayload;
}

export class ToBackendSeedRecordsResponse extends MyResponse {
  payload: { [k in any]: never };
}
