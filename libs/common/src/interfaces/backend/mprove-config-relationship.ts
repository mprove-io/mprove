import { IsArray, IsOptional, IsString } from 'class-validator';
import { MproveConfigReference } from './mprove-config-reference';

export class MproveConfigRelationship {
  @IsOptional()
  @IsString()
  schema: string;

  @IsOptional()
  @IsArray()
  references: MproveConfigReference[];
}
