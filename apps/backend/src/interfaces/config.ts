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

  @IsEnum(common.BoolEnum)
  backendLogIsStringify?: common.BoolEnum;

  @IsEnum(common.BoolEnum)
  backendLogIsColor?: common.BoolEnum;

  @IsEnum(common.BoolEnum)
  backendLogResponseError?: common.BoolEnum;

  @IsEnum(common.BoolEnum)
  backendLogResponseOk?: common.BoolEnum;

  @IsEnum(common.BoolEnum)
  backendLogOnSender?: common.BoolEnum;

  @IsEnum(common.BoolEnum)
  backendLogOnResponser?: common.BoolEnum;
}
