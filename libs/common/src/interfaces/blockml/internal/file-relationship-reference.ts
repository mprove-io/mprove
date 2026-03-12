import { RelationshipTypeEnum } from '#common/enums/relationship-type.enum';

export interface FileRelationshipReference {
  from?: string;
  from_line_num?: number;

  to?: string;
  to_line_num?: number;

  to_schema?: string;
  to_schema_line_num?: number;

  type?: RelationshipTypeEnum;
  type_line_num?: number;
}
