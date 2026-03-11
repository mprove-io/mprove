import { IsEnum, IsOptional, IsString } from 'class-validator';
import { DatabricksAuthTypeEnum } from '#common/enums/databricks-auth-type.enum';

export class OptionsDatabricks {
  @IsOptional()
  @IsEnum(DatabricksAuthTypeEnum)
  authType?: DatabricksAuthTypeEnum;

  @IsOptional()
  @IsString()
  host: string;

  @IsOptional()
  @IsString()
  path: string;

  @IsOptional()
  @IsString()
  token?: string;

  @IsOptional()
  @IsString()
  oauthClientId?: string;

  @IsOptional()
  @IsString()
  oauthClientSecret?: string;

  @IsOptional()
  @IsString()
  defaultCatalog?: string;

  @IsOptional()
  @IsString()
  defaultSchema?: string;
}
