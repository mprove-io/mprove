import { RelationshipTypeEnum } from '#common/enums/relationship-type.enum';

export interface FileSchemaRelationship {
  to?: string;
  to_line_num?: number;

  to_schema?: string;
  to_schema_line_num?: number;

  type?: RelationshipTypeEnum;
  type_line_num?: number;
}
