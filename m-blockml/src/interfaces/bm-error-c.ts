import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { BmErrorCLine } from '../interfaces/bm-error-c-line';
import { enums } from '../barrels/enums';

export class BmErrorC {
  // @IsString()
  // id: string;

  @IsEnum(enums.ErTitleEnum)
  title: enums.ErTitleEnum;

  @IsString()
  message: string;

  @ValidateNested()
  @Type(() => BmErrorCLine)
  lines: BmErrorCLine[];

  @IsOptional()
  @IsString()
  at?: string;
}
