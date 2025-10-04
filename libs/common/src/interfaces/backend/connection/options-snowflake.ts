import { IsOptional, IsString } from 'class-validator';

export class OptionsSnowflake {
  @IsOptional()
  @IsString()
  account: string;

  @IsOptional()
  @IsString()
  warehouse: string;

  @IsOptional()
  @IsString()
  database: string;

  @IsOptional()
  @IsString()
  username: string;

  @IsOptional()
  @IsString()
  password: string;
}
