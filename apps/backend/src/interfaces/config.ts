import { IsEnum, IsInt, IsNumber, IsString } from 'class-validator';
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
  rabbitUser?: string;

  @IsString()
  rabbitPass?: string;

  @IsString()
  rabbitProtocol?: string;

  @IsString()
  rabbitHost?: string;

  @IsString()
  rabbitPort?: string;

  @IsString()
  mysqlHost?: string;

  @IsNumber()
  mysqlPort?: number;

  @IsString()
  mysqlUsername?: string;

  @IsString()
  mysqlPassword?: string;

  @IsString()
  mysqlDatabase?: string;
}
