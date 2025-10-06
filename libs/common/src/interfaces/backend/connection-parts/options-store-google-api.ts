import { Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { ApiHeader } from './api-header';

export class OptionsStoreGoogleApi {
  @IsOptional()
  @ValidateNested()
  @Type(() => ApiHeader)
  headers: ApiHeader[];

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
