import { Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { ConnectionOptionsHeader } from './connection-options-header';

export class ConnectionStoreApiOptions {
  @IsOptional()
  @ValidateNested()
  @Type(() => ConnectionOptionsHeader)
  headers: ConnectionOptionsHeader[];

  @IsOptional()
  @IsString()
  baseUrl: string;
}
