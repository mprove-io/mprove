import { IsInt, IsOptional, IsString } from 'class-validator';

export class ConnectionOptionsMysql {
  @IsOptional()
  @IsString()
  host: string;

  @IsOptional()
  @IsInt()
  port: number;

  @IsOptional()
  @IsString()
  database: string;

  @IsOptional()
  @IsString()
  user: string;

  @IsOptional()
  @IsString()
  password: string;
}
