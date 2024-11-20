import { IsBoolean, IsEnum, IsString } from 'class-validator';
import { enums } from '~common/barrels/enums';

export class JoinAggregation {
  @IsString()
  joinAs: string;

  @IsBoolean()
  isSafeAggregation: boolean;

  @IsEnum(enums.JoinRelationshipEnum)
  relationship?: enums.JoinRelationshipEnum;
}
