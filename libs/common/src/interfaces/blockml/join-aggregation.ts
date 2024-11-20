import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { enums } from '~common/barrels/enums';

export class JoinAggregation {
  @IsString()
  joinAs: string;

  @IsBoolean()
  isSafeAggregation: boolean;

  @IsOptional()
  @IsEnum(enums.JoinRelationshipEnum)
  relationship?: enums.JoinRelationshipEnum;
}
