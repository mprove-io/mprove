import { IsEnum, IsOptional, IsString } from 'class-validator';
import { enums } from '~common/barrels/enums';

export class QueryOperation {
  @IsEnum(enums.QueryOperationTypeEnum)
  type: enums.QueryOperationTypeEnum;

  @IsString()
  timezone: string;

  @IsOptional()
  @IsString()
  fieldId: string;
}
