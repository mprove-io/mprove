import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString
} from 'class-validator';
import { EmailTransportEnum } from '#common/enums/email-transport.enum';
import { BackendEnvEnum } from '#common/enums/env/backend-env.enum';
import { ProjectRemoteTypeEnum } from '#common/enums/project-remote-type.enum';

export class BackendConfig {
  @IsString()
  mproveReleaseTag?: string;

  @IsBoolean()
  isTelemetryEnabled?: boolean;

  @IsOptional()
  @IsString()
  telemetryEndpoint?: string;

  @IsOptional()
  @IsString()
  telemetryHyperdxIngestApiKey?: string;

  @IsOptional()
  @IsString()
  otelLogLevel?: string;

  @IsEnum(BackendEnvEnum)
  backendEnv?: BackendEnvEnum;

  @IsBoolean()
  isEncryptDb?: boolean;

  @IsBoolean()
  isEncryptMetadata?: boolean;

  @IsString()
  aesKey?: string;

  @IsString()
  aesKeyTag?: string;

  @IsOptional()
  @IsString()
  prevAesKey?: string;

  @IsOptional()
  @IsString()
  prevAesKeyTag?: string;

  @IsNumber()
  totalDiskShards?: number;

  @IsNumber()
  rpcDiskTimeoutMs?: number;

  @IsNumber()
  rpcBlockmlTimeoutMs?: number;

  @IsBoolean()
  isScheduler?: boolean;

  @IsOptional()
  @IsString()
  demoProjectDwhBigqueryCredentialsPath?: string;

  @IsOptional()
  @IsString()
  demoProjectDwhGoogleApiCredentialsPath?: string;

  @IsString()
  jwtSecret?: string;

  @IsString()
  specialKey?: string;

  @IsBoolean()
  allowTestRoutes?: boolean;

  @IsString()
  mproveAdminEmail?: string;

  @IsString()
  mproveAdminInitialPassword?: string;

  @IsOptional()
  @IsString()
  storeApiBlockHosts?: string;

  @IsOptional()
  @IsString()
  storeApiAllowHosts?: string;

  @IsBoolean()
  seedDemoOrgAndProject?: boolean;

  @IsOptional()
  @IsString()
  demoOrgId?: string;

  @IsOptional()
  @IsString()
  demoProjectId?: string;

  @IsOptional()
  @IsString()
  demoProjectName?: string;

  @IsOptional()
  @IsEnum(ProjectRemoteTypeEnum)
  demoProjectRemoteType?: ProjectRemoteTypeEnum;

  @IsOptional()
  @IsString()
  demoProjectRemoteGitUrl?: string;

  @IsOptional()
  @IsString()
  demoProjectRemotePrivateKeyEncryptedPath?: string;

  @IsOptional()
  @IsString()
  demoProjectRemotePublicKeyPath?: string;

  @IsOptional()
  @IsString()
  demoProjectRemotePassPhrase?: string;

  @IsOptional()
  @IsString()
  demoProjectDwhPostgresHost?: string;

  @IsOptional()
  @IsString()
  demoProjectDwhPostgresUser?: string;

  @IsOptional()
  @IsString()
  demoProjectDwhPostgresPassword?: string;

  // @IsOptional()
  // @IsString()
  // demoProjectDwhClickhousePassword?: string;

  @IsOptional()
  @IsString()
  demoProjectDwhMysqlHost?: string;

  @IsOptional()
  @IsNumber()
  demoProjectDwhMysqlPort?: number;

  @IsOptional()
  @IsString()
  demoProjectDwhMysqlDatabase?: string;

  @IsOptional()
  @IsString()
  demoProjectDwhMysqlUser?: string;

  @IsOptional()
  @IsString()
  demoProjectDwhMysqlPassword?: string;

  @IsOptional()
  @IsString()
  demoProjectDwhTrinoUser?: string;

  @IsOptional()
  @IsString()
  demoProjectDwhTrinoPassword?: string;

  @IsOptional()
  @IsString()
  demoProjectDwhPrestoUser?: string;

  @IsOptional()
  @IsString()
  demoProjectDwhPrestoPassword?: string;

  @IsOptional()
  @IsString()
  demoProjectDwhSnowflakeAccount?: string;

  @IsOptional()
  @IsString()
  demoProjectDwhSnowflakeWarehouse?: string;

  @IsOptional()
  @IsString()
  demoProjectDwhSnowflakeUsername?: string;

  @IsOptional()
  @IsString()
  demoProjectDwhSnowflakePassword?: string;

  @IsOptional()
  @IsString()
  demoProjectDwhMotherDuckToken?: string;

  @IsString()
  calcPostgresHost?: string;

  @IsNumber()
  calcPostgresPort?: number;

  @IsString()
  calcPostgresUsername?: string;

  @IsString()
  calcPostgresPassword?: string;

  @IsBoolean()
  allowUsersToCreateOrganizations?: boolean;

  @IsBoolean()
  registerOnlyInvitedUsers?: boolean;

  @IsString()
  hostUrl?: string;

  @IsString()
  sendEmailFromName?: string;

  @IsString()
  sendEmailFromAddress?: string;

  @IsEnum(EmailTransportEnum)
  emailTransport?: EmailTransportEnum;

  @IsString()
  smtpHost?: string;

  @IsInt()
  smtpPort?: number;

  @IsBoolean()
  smtpSecure?: boolean;

  @IsString()
  smtpAuthUser?: string;

  @IsString()
  smtpAuthPassword?: string;

  @IsBoolean()
  backendIsForwardTelemetryEnabled?: boolean;

  @IsString()
  backendValkeyHost?: string;

  @IsString()
  backendValkeyPassword?: string;

  @IsString()
  backendPostgresDatabaseUrl?: string;

  @IsBoolean()
  backendIsPostgresTls?: boolean;

  @IsOptional()
  @IsString()
  backendRequestIpHeaderA?: string;

  @IsOptional()
  @IsString()
  backendRequestIpHeaderB?: string;

  @IsBoolean()
  backendThrottlePublicRoutesByIp?: boolean;

  @IsBoolean()
  backendThrottlePrivateRoutesByUserId?: boolean;

  @IsBoolean()
  backendLogThrottleTracker?: boolean;

  @IsBoolean()
  backendLogDrizzlePostgres?: boolean;

  @IsBoolean()
  backendLogIsJson?: boolean;

  @IsBoolean()
  backendLogResponseError?: boolean;

  @IsBoolean()
  backendLogResponseOk?: boolean;

  @IsOptional()
  @IsString()
  e2bApiKey?: string;

  @IsOptional()
  @IsString()
  sandboxAgentToken?: string;

  @IsOptional()
  @IsNumber()
  sandboxTimeoutMinutes?: number;

  @IsOptional()
  @IsNumber()
  sandboxIdleMinutes?: number;

  @IsOptional()
  @IsNumber()
  sandboxRefreshMinutes?: number;

  @IsOptional()
  @IsNumber()
  maxActiveSessionsPerUser?: number;

  @IsOptional()
  @IsNumber()
  coordinatorLockTtlSeconds?: number;

  @IsOptional()
  @IsNumber()
  coordinatorHeartbeatMs?: number;
}
