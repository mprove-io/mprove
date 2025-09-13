import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

export class ConnectionClickhouseOptions {
  @IsOptional()
  @IsString()
  host: string;

  @IsOptional()
  @IsInt()
  port: number;

  @IsOptional()
  @IsString()
  username: string;

  @IsOptional()
  @IsString()
  password: string;

  @IsOptional()
  @IsBoolean()
  isSSL: boolean;
}
