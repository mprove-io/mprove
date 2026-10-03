import type { FileSchemaRelationship } from '#common/types/blockml/parts/internal/file-schema-relationship';

export type FileSchemaColumn = {
  column?: string;
  column_line_num?: number;
  example?: string;
  example_line_num?: number;
  description?: string;
  description_line_num?: number;
  cache_unique_values?: string;
  cache_unique_values_line_num?: number;
  relationships?: FileSchemaRelationship[];
  relationships_line_num?: number;
};
