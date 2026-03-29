import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

export class OptionsPostgres {
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
  username: string;

  @IsOptional()
  @IsString()
  password: string;

  @IsOptional()
  @IsBoolean()
  isSSL: boolean;
}
