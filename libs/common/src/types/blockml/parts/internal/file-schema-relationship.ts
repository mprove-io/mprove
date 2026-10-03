import type { RelationshipTypeEnum } from '#common/enums/relationship-type.enum';
import type { EnumValues } from '#common/types/enum-values';

export type FileSchemaRelationship = {
  to?: string;
  to_line_num?: number;
  to_schema?: string;
  to_schema_line_num?: number;
  type?: EnumValues<typeof RelationshipTypeEnum>;
  type_line_num?: number;
};
