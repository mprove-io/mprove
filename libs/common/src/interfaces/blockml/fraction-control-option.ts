import { IsOptional, IsString } from 'class-validator';

export class FractionControlOption {
  @IsString()
  value: string;

  @IsOptional()
  @IsString()
  label: string;
}
