import { IsOptional, IsString } from 'class-validator';
import type { ConnectionOptions } from 'trino-client';

export class ConnectionPrestoTrinoCommonOptions {
  @IsOptional()
  @IsString()
  server?: string;

  @IsOptional()
  @IsString()
  catalog?: string;

  @IsOptional()
  @IsString()
  schema?: string;

  @IsOptional()
  @IsString()
  user?: string;

  @IsOptional()
  @IsString()
  password?: string;

  extraConfig?: Partial<
    Omit<ConnectionOptions, keyof ConnectionPrestoTrinoCommonOptions>
  >;
}
