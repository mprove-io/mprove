import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import { RelationshipTypeEnum } from '#common/enums/relationship-type.enum';

export class ExtraSchemaRelationship {
  @IsString()
  to: string;

  @IsOptional()
  @IsString()
  toSchema: string;

  @IsEnum(RelationshipTypeEnum)
  type: RelationshipTypeEnum;
}

export class ExtraSchemaColumn {
  @IsString()
  column: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  example: string;

  @IsArray()
  relationships: ExtraSchemaRelationship[];
}

export class ExtraSchemaTable {
  @IsString()
  table: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsArray()
  columns: ExtraSchemaColumn[];
}

export class ExtraSchema {
  @IsString()
  schema: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsArray()
  tables: ExtraSchemaTable[];
}
