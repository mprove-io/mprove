import { IsEnum, IsInt, IsString } from 'class-validator';
import { common } from '~backend/barrels/common';
import { enums } from '~backend/barrels/enums';

export class Config extends common.Config {
  @IsEnum(enums.BackendEnvEnum)
  backendEnv?: enums.BackendEnvEnum;

  @IsEnum(common.BoolEnum)
  isScheduler?: common.BoolEnum;

  @IsString()
  mDataBigqueryPath?: string;

  @IsString()
  jwtSecret?: string;

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

  @IsEnum(common.BoolEnum)
  registerOnlyInvitedUsers?: common.BoolEnum;

  //

  @IsEnum(common.BoolEnum)
  sendEmail?: common.BoolEnum;

  @IsString()
  hostUrl?: string;

  @IsString()
  sendEmailFromName?: string;

  @IsString()
  sendEmailFromAddress?: string;

  @IsEnum(enums.EmailTransportEnum)
  emailTransport?: enums.EmailTransportEnum;

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
  rabbitmqDefaultUser?: string;

  @IsString()
  rabbitmqDefaultPass?: string;

  @IsString()
  mysqlRootPassword?: string;

  @IsString()
  mysqlDatabase?: string;
}
