import { Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { ErrorLine } from '../interfaces/error-line';

export class BmErrorC {
  @IsString()
  id: string;

  @IsString()
  title: string;

  @IsString()
  message: string;

  @ValidateNested()
  @Type(() => ErrorLine)
  lines: ErrorLine[];

  @IsOptional()
  @IsString()
  at?: string;
}
