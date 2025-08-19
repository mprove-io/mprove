import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { JoinRelationshipEnum } from '~common/enums/join-relationship.enum';

export class JoinAggregation {
  @IsString()
  joinAs: string;

  @IsBoolean()
  isSafeAggregation: boolean;

  @IsOptional()
  @IsEnum(JoinRelationshipEnum)
  relationship?: JoinRelationshipEnum;
}
