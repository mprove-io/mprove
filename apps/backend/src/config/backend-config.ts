import { IsEnum, IsInt, IsNumber, IsString } from 'class-validator';
import { BoolEnum } from '~common/enums/bool.enum';
import { EmailTransportEnum } from '~common/enums/email-transport.enum';
import { BackendEnvEnum } from '~common/enums/env/backend-env.enum';
import { ProjectRemoteTypeEnum } from '~common/enums/project-remote-type.enum';

export class BackendConfig {
  @IsEnum(BackendEnvEnum)
  backendEnv?: BackendEnvEnum;

  @IsEnum(BoolEnum)
  isDbEncryptionEnabled?: BoolEnum;

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

  @IsEnum(BoolEnum)
  isScheduler?: BoolEnum;

  @IsString()
  demoProjectDwhBigqueryCredentialsPath?: string;

  @IsString()
  demoProjectDwhGoogleApiCredentialsPath?: string;

  @IsString()
  jwtSecret?: string;

  @IsString()
  specialKey?: string;

  @IsEnum(BoolEnum)
  allowTestRoutes?: BoolEnum;

  @IsString()
  mproveAdminEmail?: string;

  @IsString()
  mproveAdminInitialPassword?: string;

  @IsEnum(BoolEnum)
  seedDemoOrgAndProject?: BoolEnum;

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
  demoProjectRemotePrivateKeyPath?: string;

  @IsString()
  demoProjectRemotePublicKeyPath?: string;

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

  @IsEnum(BoolEnum)
  allowUsersToCreateOrganizations?: BoolEnum;

  @IsEnum(BoolEnum)
  registerOnlyInvitedUsers?: BoolEnum;

  //

  // @IsEnum(BoolEnum)
  // sendEmail?: BoolEnum;

  @IsString()
  hostUrl?: string;

  @IsString()
  sendEmailFromName?: string;

  @IsString()
  sendEmailFromAddress?: string;

  @IsEnum(EmailTransportEnum)
  emailTransport?: EmailTransportEnum;

  //
  @IsString()
  smtpHost?: string;

  @IsInt()
  smtpPort?: number;

  @IsEnum(BoolEnum)
  smtpSecure?: BoolEnum;

  @IsString()
  smtpAuthUser?: string;

  @IsString()
  smtpAuthPassword?: string;

  //
  @IsString()
  backendRedisHost?: string;

  @IsString()
  backendRedisPassword?: string;

  //
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

  @IsEnum(BoolEnum)
  backendIsPostgresTls?: BoolEnum;

  @IsEnum(BoolEnum)
  backendThrottlePublicRoutesByIp?: BoolEnum;

  @IsEnum(BoolEnum)
  backendThrottlePrivateRoutesByUserId?: BoolEnum;

  @IsEnum(BoolEnum)
  backendLogDrizzlePostgres?: BoolEnum;

  @IsEnum(BoolEnum)
  backendLogIsJson?: BoolEnum;

  @IsEnum(BoolEnum)
  backendLogResponseError?: BoolEnum;

  @IsEnum(BoolEnum)
  backendLogResponseOk?: BoolEnum;
}
