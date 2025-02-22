import { IsOptional, IsString } from 'class-validator';

export class FractionSubTypeOption {
  @IsString()
  value: string;

  @IsOptional()
  @IsString()
  label: string;
}
