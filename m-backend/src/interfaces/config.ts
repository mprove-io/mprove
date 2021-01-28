import { IsEnum, IsInt, IsString } from 'class-validator';
import { api } from '~/barrels/api';
import { enums } from '~/barrels/enums';

export class Config extends api.Config {
  @IsEnum(enums.BackendEnvEnum)
  backendEnv?: enums.BackendEnvEnum;

  @IsString()
  backendJwtSecret?: string;

  @IsString()
  backendFirstUserEmail?: string;

  @IsString()
  backendFirstUserPassword?: string;

  @IsEnum(api.BoolEnum)
  backendRegisterOnlyInvitedUsers?: api.BoolEnum;

  //
  @IsEnum(api.BoolEnum)
  backendSendEmail?: api.BoolEnum;

  @IsString()
  backendVerifyEmailUrl?: string;

  @IsString()
  backendSendEmailFromName?: string;

  @IsString()
  backendSendEmailFromAddress?: string;

  @IsEnum(enums.EmailTransportEnum)
  backendEmailTransport?: enums.EmailTransportEnum;

  @IsString()
  backendMailgunActiveApiKey?: string;

  @IsString()
  backendMailgunDomain?: string;

  //
  @IsString()
  backendSmtpHost?: string;

  @IsInt()
  backendSmtpPort?: number;

  @IsEnum(api.BoolEnum)
  backendSmtpSecure?: api.BoolEnum;

  @IsString()
  backendSmtpAuthUser?: string;

  @IsString()
  backendSmtpAuthPassword?: string;

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
