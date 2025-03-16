import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { Fraction } from './fraction';

export class Parameter {
  @IsString()
  apply_to: string;

  @IsString()
  listen: string;

  @ValidateNested()
  @Type(() => Fraction)
  fractions: Fraction[];
}
