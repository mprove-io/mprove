import { Type } from 'class-transformer';
import { IsOptional, ValidateNested } from 'class-validator';
import { ConnectionTabOptions } from './connection-tab-options';

export class ConnectionTab {
  @IsOptional()
  @ValidateNested()
  @Type(() => ConnectionTabOptions)
  options?: ConnectionTabOptions;
}
