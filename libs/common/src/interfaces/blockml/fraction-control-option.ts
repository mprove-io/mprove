import { IsString } from 'class-validator';

export class FractionControlOption {
  @IsString()
  value: string;

  @IsString()
  label: string;
}
