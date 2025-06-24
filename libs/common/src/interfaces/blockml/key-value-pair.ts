import { IsOptional, IsString } from 'class-validator';

export class KeyValuePair {
  @IsString()
  key: string;

  @IsOptional()
  @IsString()
  value: string;
}
