import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class ConnectionOptionsMotherduck {
  @IsOptional()
  @IsString()
  motherduckToken: string;

  @IsOptional()
  @IsString()
  database: string;

  @IsOptional()
  @IsBoolean()
  attachModeSingle: boolean;

  @IsOptional()
  @IsBoolean()
  accessModeReadOnly: boolean;
}
