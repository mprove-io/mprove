import { IsEnum, IsInt, IsNumber, IsString } from 'class-validator';
import { common } from '~backend/barrels/common';
import { enums } from '~backend/barrels/enums';

export class Config {
  @IsEnum(enums.BackendEnvEnum)
  backendEnv?: enums.BackendEnvEnum;

  @IsEnum(common.BoolEnum)
  isScheduler?: common.BoolEnum;

  @IsString()
  firstProjectDwhBigqueryCredentialsPath?: string;

  @IsString()
  jwtSecret?: string;

  @IsString()
  specialKey?: string;

  @IsEnum(common.BoolEnum)
  allowTestRoutes?: common.BoolEnum;

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

  @IsEnum(common.ProjectRemoteTypeEnum)
  firstProjectRemoteType?: common.ProjectRemoteTypeEnum;

  @IsString()
  firstProjectRemoteGitUrl?: string;

  @IsString()
  firstProjectRemotePrivateKeyPath?: string;

  @IsString()
  firstProjectRemotePublicKeyPath?: string;

  @IsEnum(common.BoolEnum)
  firstProjectSeedConnections?: common.BoolEnum;

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

  @IsEnum(common.BoolEnum)
  allowUsersToCreateOrganizations?: common.BoolEnum;

  @IsEnum(common.BoolEnum)
  registerOnlyInvitedUsers?: common.BoolEnum;

  //

  // @IsEnum(common.BoolEnum)
  // sendEmail?: common.BoolEnum;

  @IsString()
  hostUrl?: string;

  @IsString()
  sendEmailFromName?: string;

  @IsString()
  sendEmailFromAddress?: string;

  @IsEnum(enums.EmailTransportEnum)
  emailTransport?: enums.EmailTransportEnum;

  //
  @IsString()
  mailgunActiveApiKey?: string;

  @IsString()
  mailgunDomain?: string;

  //
  @IsString()
  smtpHost?: string;

  @IsInt()
  smtpPort?: number;

  @IsEnum(common.BoolEnum)
  smtpSecure?: common.BoolEnum;

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

  @IsEnum(common.BoolEnum)
  backendIsPostgresTls?: common.BoolEnum;

  @IsEnum(common.BoolEnum)
  backendLogDrizzlePostgres?: common.BoolEnum;

  @IsEnum(common.BoolEnum)
  backendLogIsJson?: common.BoolEnum;

  @IsEnum(common.BoolEnum)
  backendLogResponseError?: common.BoolEnum;

  @IsEnum(common.BoolEnum)
  backendLogResponseOk?: common.BoolEnum;
}
