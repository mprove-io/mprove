import type { RelationshipType } from '#common/types/shared/schema/relationship-type';

export type FileSchemaRelationship = {
  to?: string;
  to_line_num?: number;
  to_schema?: string;
  to_schema_line_num?: number;
  type?: RelationshipType;
  type_line_num?: number;
};
