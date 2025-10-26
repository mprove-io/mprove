import { IsBoolean, IsEnum, IsInt, IsNumber, IsString } from 'class-validator';
import { EmailTransportEnum } from '~common/enums/email-transport.enum';
import { BackendEnvEnum } from '~common/enums/env/backend-env.enum';
import { ProjectRemoteTypeEnum } from '~common/enums/project-remote-type.enum';

export class BackendConfig {
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

  @IsString()
  prevAesKey?: string;

  @IsString()
  prevAesKeyTag?: string;

  @IsString()
  mproveReleaseTag?: string;

  @IsBoolean()
  isScheduler?: boolean;

  @IsString()
  demoProjectDwhBigqueryCredentialsPath?: string;

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

  @IsBoolean()
  seedDemoOrgAndProject?: boolean;

  @IsString()
  demoOrgId?: string;

  @IsString()
  demoProjectId?: string;

  @IsString()
  demoProjectName?: string;

  @IsEnum(ProjectRemoteTypeEnum)
  demoProjectRemoteType?: ProjectRemoteTypeEnum;

  @IsString()
  demoProjectRemoteGitUrl?: string;

  @IsString()
  demoProjectRemotePrivateKeyEncryptedPath?: string;

  @IsString()
  demoProjectRemotePublicKeyPath?: string;

  @IsString()
  demoProjectRemotePassPhrase?: string;

  @IsString()
  demoProjectDwhPostgresHost?: string;

  @IsString()
  demoProjectDwhPostgresPassword?: string;

  @IsString()
  demoProjectDwhClickhousePassword?: string;

  @IsString()
  demoProjectDwhMysqlHost?: string;

  @IsNumber()
  demoProjectDwhMysqlPort?: number;

  @IsString()
  demoProjectDwhMysqlDatabase?: string;

  @IsString()
  demoProjectDwhMysqlUser?: string;

  @IsString()
  demoProjectDwhMysqlPassword?: string;

  @IsString()
  demoProjectDwhTrinoUser?: string;

  @IsString()
  demoProjectDwhTrinoPassword?: string;

  @IsString()
  demoProjectDwhPrestoUser?: string;

  @IsString()
  demoProjectDwhPrestoPassword?: string;

  @IsString()
  demoProjectDwhSnowflakeAccount?: string;

  @IsString()
  demoProjectDwhSnowflakeWarehouse?: string;

  @IsString()
  demoProjectDwhSnowflakeUsername?: string;

  @IsString()
  demoProjectDwhSnowflakePassword?: string;

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

  @IsString()
  backendValkeyHost?: string;

  @IsString()
  backendValkeyPassword?: string;

  @IsString()
  backendRabbitUser?: string;

  @IsString()
  backendRabbitPass?: string;

  @IsString()
  backendRabbitProtocol?: string;

  @IsString()
  backendRabbitHost?: string;

  @IsString()
  backendRabbitPort?: string;

  @IsString()
  backendPostgresDatabaseUrl?: string;

  @IsBoolean()
  backendIsPostgresTls?: boolean;

  @IsBoolean()
  backendThrottlePublicRoutesByIp?: boolean;

  @IsBoolean()
  backendThrottlePrivateRoutesByUserId?: boolean;

  @IsBoolean()
  backendLogDrizzlePostgres?: boolean;

  @IsBoolean()
  backendLogIsJson?: boolean;

  @IsBoolean()
  backendLogResponseError?: boolean;

  @IsBoolean()
  backendLogResponseOk?: boolean;
}
