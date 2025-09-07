import { IsEnum, IsInt, IsNumber, IsString } from 'class-validator';
import { BoolEnum } from '~common/enums/bool.enum';
import { EmailTransportEnum } from '~common/enums/email-transport.enum';
import { BackendEnvEnum } from '~common/enums/env/backend-env.enum';
import { ProjectRemoteTypeEnum } from '~common/enums/project-remote-type.enum';

export class BackendConfig {
  @IsEnum(BackendEnvEnum)
  backendEnv?: BackendEnvEnum;

  @IsString()
  mproveReleaseTag?: string;

  @IsEnum(BoolEnum)
  isScheduler?: BoolEnum;

  @IsString()
  firstProjectDwhBigqueryCredentialsPath?: string;

  @IsString()
  firstProjectGoogleApiCredentialsPath?: string;

  @IsString()
  jwtSecret?: string;

  @IsString()
  specialKey?: string;

  @IsEnum(BoolEnum)
  allowTestRoutes?: BoolEnum;

  @IsString()
  firstUserEmail?: string;

  @IsString()
  firstUserPassword?: string;

  @IsString()
  firstOrgId?: string;

  @IsString()
  firstProjectId?: string;

  @IsString()
  firstProjectName?: string;

  @IsEnum(ProjectRemoteTypeEnum)
  firstProjectRemoteType?: ProjectRemoteTypeEnum;

  @IsString()
  firstProjectRemoteGitUrl?: string;

  @IsString()
  firstProjectRemotePrivateKeyPath?: string;

  @IsString()
  firstProjectRemotePublicKeyPath?: string;

  @IsEnum(BoolEnum)
  firstProjectSeedConnections?: BoolEnum;

  @IsString()
  firstProjectDwhPostgresHost?: string;

  @IsString()
  firstProjectDwhPostgresPassword?: string;

  @IsString()
  firstProjectDwhClickhousePassword?: string;

  @IsString()
  firstProjectDwhSnowflakeAccount?: string;

  @IsString()
  firstProjectDwhSnowflakeWarehouse?: string;

  @IsString()
  firstProjectDwhSnowflakeUsername?: string;

  @IsString()
  firstProjectDwhSnowflakePassword?: string;

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
  backendMysqlHost?: string;

  @IsNumber()
  backendMysqlPort?: number;

  @IsString()
  backendMysqlUsername?: string;

  @IsString()
  backendMysqlPassword?: string;

  @IsString()
  backendMysqlDatabase?: string;

  @IsString()
  backendPostgresDatabaseUrl?: string;

  @IsEnum(BoolEnum)
  backendIsPostgresTls?: BoolEnum;

  @IsEnum(BoolEnum)
  backendLogDrizzlePostgres?: BoolEnum;

  @IsEnum(BoolEnum)
  backendLogIsJson?: BoolEnum;

  @IsEnum(BoolEnum)
  backendLogResponseError?: BoolEnum;

  @IsEnum(BoolEnum)
  backendLogResponseOk?: BoolEnum;
}
