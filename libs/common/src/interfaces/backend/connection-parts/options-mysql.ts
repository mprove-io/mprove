import { IsInt, IsOptional, IsString } from 'class-validator';

export class OptionsMysql {
  @IsOptional()
  @IsString()
  host: string;

  @IsOptional()
  @IsString()
  internalHost?: string;

  @IsOptional()
  @IsInt()
  port: number;

  @IsOptional()
  @IsInt()
  internalPort?: number;

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
