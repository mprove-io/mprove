import { IsEnum, IsOptional, IsString } from 'class-validator';
import { RelationshipTypeEnum } from '#common/enums/relationship-type.enum';

export class MproveConfigReference {
  @IsOptional()
  @IsString()
  from: string;

  @IsOptional()
  @IsString()
  to: string;

  @IsOptional()
  @IsString()
  toSchema: string;

  @IsOptional()
  @IsEnum(RelationshipTypeEnum)
  type: RelationshipTypeEnum;
}
