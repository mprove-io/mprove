import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { ErrorLine } from '../interfaces/error-line';
import { enums } from '../barrels/enums';

export class BmErrorC {
  @IsString()
  id: string;

  @IsEnum(enums.ErTitleEnum)
  title: enums.ErTitleEnum;

  @IsString()
  message: string;

  @ValidateNested()
  @Type(() => ErrorLine)
  lines: ErrorLine[];

  @IsOptional()
  @IsString()
  at?: string;
}
