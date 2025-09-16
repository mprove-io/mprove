import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { ConnectionTypeEnum } from '~common/enums/connection-type.enum';
import { ProjectRemoteTypeEnum } from '~common/enums/project-remote-type.enum';
import { ConnectionBigqueryOptions } from '~common/interfaces/backend/connection/connection-bigquery-options';
import { ConnectionClickhouseOptions } from '~common/interfaces/backend/connection/connection-clickhouse-options';
import { ConnectionMotherduckOptions } from '~common/interfaces/backend/connection/connection-motherduck-options';
import { ConnectionMysqlOptions } from '~common/interfaces/backend/connection/connection-mysql-options';
import { ConnectionPostgresOptions } from '~common/interfaces/backend/connection/connection-postgres-options';
import { ConnectionSnowflakeOptions } from '~common/interfaces/backend/connection/connection-snowflake-options';
import { ConnectionStoreApiOptions } from '~common/interfaces/backend/connection/connection-store-api-options';
import { ConnectionStoreGoogleApiOptions } from '~common/interfaces/backend/connection/connection-store-google-api-options';
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
  @ValidateNested()
  @Type(() => ConnectionBigqueryOptions)
  bigqueryOptions?: ConnectionBigqueryOptions;

  @IsOptional()
  @ValidateNested()
  @Type(() => ConnectionClickhouseOptions)
  clickhouseOptions?: ConnectionClickhouseOptions;

  @IsOptional()
  @ValidateNested()
  @Type(() => ConnectionMotherduckOptions)
  motherduckOptions?: ConnectionMotherduckOptions;

  @IsOptional()
  @ValidateNested()
  @Type(() => ConnectionPostgresOptions)
  postgresOptions?: ConnectionPostgresOptions;

  @IsOptional()
  @ValidateNested()
  @Type(() => ConnectionMysqlOptions)
  mysqlOptions?: ConnectionMysqlOptions;

  @IsOptional()
  @ValidateNested()
  @Type(() => ConnectionSnowflakeOptions)
  snowflakeOptions?: ConnectionSnowflakeOptions;

  @IsOptional()
  @ValidateNested()
  @Type(() => ConnectionStoreApiOptions)
  storeApiOptions?: ConnectionStoreApiOptions;

  @IsOptional()
  @ValidateNested()
  @Type(() => ConnectionStoreGoogleApiOptions)
  storeGoogleApiOptions?: ConnectionStoreGoogleApiOptions;
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
