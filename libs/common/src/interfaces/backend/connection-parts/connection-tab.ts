import { Type } from 'class-transformer';
import { IsOptional, ValidateNested } from 'class-validator';
import { ConnectionOptions } from './connection-options';

export class ConnectionTab {
  @IsOptional()
  @ValidateNested()
  @Type(() => ConnectionOptions)
  options?: ConnectionOptions;
}
