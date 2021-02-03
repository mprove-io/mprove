import { IsEnum, IsInt, IsString } from 'class-validator';
import { api } from '~backend/barrels/api';
import { enums } from '~backend/barrels/enums';

export class Config extends api.Config {
  @IsEnum(enums.BackendEnvEnum)
  backendEnv?: enums.BackendEnvEnum;

  @IsString()
  jwtSecret?: string;

  @IsString()
  firstUserEmail?: string;

  @IsString()
  firstUserPassword?: string;

  @IsEnum(api.BoolEnum)
  registerOnlyInvitedUsers?: api.BoolEnum;

  //
  @IsEnum(api.BoolEnum)
  sendEmail?: api.BoolEnum;

  @IsString()
  verifyEmailUrl?: string;

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

  @IsEnum(api.BoolEnum)
  smtpSecure?: api.BoolEnum;

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
