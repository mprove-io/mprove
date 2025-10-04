import { Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { ApiHeader } from './api-header';

export class OptionsStoreApi {
  @IsOptional()
  @ValidateNested()
  @Type(() => ApiHeader)
  headers: ApiHeader[];

  @IsOptional()
  @IsString()
  baseUrl: string;
}
