import { Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { ConnectionOptionsHeader } from './connection-options-header';

export class ConnectionStoreGoogleApiOptions {
  @IsOptional()
  @ValidateNested()
  @Type(() => ConnectionOptionsHeader)
  headers: ConnectionOptionsHeader[];

  @IsOptional()
  @IsString()
  baseUrl: string;

  @IsOptional()
  @IsString({ each: true })
  googleAuthScopes: string[];

  @IsOptional()
  serviceAccountCredentials: any;

  @IsOptional()
  @IsString()
  googleCloudProject: string;

  @IsOptional()
  @IsString()
  googleCloudClientEmail: string;

  @IsOptional()
  @IsString()
  googleAccessToken: string;
}
